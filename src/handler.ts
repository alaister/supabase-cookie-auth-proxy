import { parse, serialize } from 'cookie'
import jwt from '@tsndr/cloudflare-worker-jwt'
import { Session, User } from './types'

declare global {
  const WORKERS_DEMO_KV: KVNamespace
  const JWT_SECRET: string
  const SUPABASE_HOSTNAME: string
  const SUPABASE_ANON_KEY: string
}

async function websocket(url: string) {
  const resp = await fetch(url, {
    headers: {
      Upgrade: 'websocket',
    },
  })

  const ws = resp.webSocket
  if (!ws) {
    throw new Error("server didn't accept WebSocket")
  }

  return ws
}

async function getSession(cookiesStr?: string | null) {
  if (cookiesStr) {
    const cookies = parse(cookiesStr)
    const sessionId = cookies['sb-session-id']
    if (sessionId) {
      const session = await WORKERS_DEMO_KV.get<Session>(sessionId, 'json')
      if (session) {
        return session
      }
    }
  }
}

// const developmentCorsHeaders = {
//   'Access-Control-Allow-Origin': 'http://localhost:3000',
//   'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
// }

export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url)

  // URL pathname can optionally start with /supabase
  if (url.pathname.startsWith('/supabase')) {
    url.pathname = url.pathname.slice(9)
  }

  const upgradeHeader = request.headers.get('Upgrade')
  if (
    upgradeHeader === 'websocket' &&
    url.pathname === '/realtime/v1/websocket'
  ) {
    const accessToken =
      (await getSession(request.headers.get('Cookie')))?.token ??
      SUPABASE_ANON_KEY

    const [client, server] = Object.values(new WebSocketPair())
    server.accept()

    const supabaseWS = await websocket(
      `https://${SUPABASE_HOSTNAME}/realtime/v1/websocket?apikey=${SUPABASE_ANON_KEY}&vsn=1.0.0`,
    )
    supabaseWS.accept()

    supabaseWS.addEventListener('message', (event) => {
      server.send(event.data)
    })

    server.addEventListener('message', (event) => {
      try {
        if (typeof event.data !== 'string') {
          throw new Error('message is not json')
        }

        const data = JSON.parse(event.data)

        if (data.event === 'phx_join') {
          supabaseWS.send(
            JSON.stringify({
              ...data,
              payload: {
                ...data.payload,
                user_token: accessToken,
              },
            }),
          )

          return
        }
      } catch (error) {
        // eat error and forward the request as is
      }

      supabaseWS.send(event.data)
    })

    return new Response(null, {
      status: 101,
      webSocket: client,
    })
  }

  const supabaseUrl = new URL(url.toString())
  supabaseUrl.hostname = SUPABASE_HOSTNAME

  const supabaseRequest = new Request(request)
  supabaseRequest.headers.set('apikey', SUPABASE_ANON_KEY)
  supabaseRequest.headers.set('Authorization', `Bearer ${SUPABASE_ANON_KEY}`)

  if (request.method === 'POST' && url.pathname === '/auth/v1/token') {
    const supabaseResponse = await fetch(
      supabaseUrl.toString(),
      supabaseRequest,
    )

    const response = new Response(
      supabaseResponse.clone().body,
      supabaseResponse,
    )

    const body = await supabaseResponse.json<{ user?: User }>()

    if (body.user) {
      const { user } = body
      const sessionId = crypto.randomUUID()
      const expires = Math.floor(Date.now() / 1000) + 31540000 // in 1 year

      const token = await jwt.sign(
        {
          aud: 'authenticated',
          sub: user.id,
          role: 'authenticated',
          exp: expires,
          sid: sessionId,
        },
        JWT_SECRET,
      )

      await WORKERS_DEMO_KV.put(
        sessionId,
        JSON.stringify({
          user,
          token,
        }),
        {
          expiration: expires,
        },
      )

      const cookie = serialize('sb-session-id', sessionId, {
        expires: new Date(expires * 1000),
        path: '/',
        secure: true,
        httpOnly: true,
        sameSite: 'lax',
      })

      response.headers.set('Set-Cookie', cookie)
    }

    return response
  }

  const session = await getSession(request.headers.get('Cookie'))

  if (request.method === 'GET' && url.pathname === '/edge/v1/session') {
    if (!session) {
      return new Response(JSON.stringify({ message: 'Unauthenticated' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }

    return new Response(
      // Filter out token
      JSON.stringify(
        Object.fromEntries(
          Object.entries(session).filter(([key]) => key !== 'token'),
        ),
      ),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
  }

  const accessToken = session?.token
  supabaseRequest.headers.set(
    'Authorization',
    `Bearer ${accessToken ?? SUPABASE_ANON_KEY}`,
  )

  return fetch(supabaseUrl.toString(), supabaseRequest)
}
