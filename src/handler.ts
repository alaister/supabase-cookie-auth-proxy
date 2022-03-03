import jwt from '@tsndr/cloudflare-worker-jwt'
import { serialize } from 'cookie'
import { removeCors } from './cors'
import { createSession, deleteSession, getSession } from './sessions'
import { User } from './types'
import { websocket } from './websocket'

declare global {
  const WORKERS_DEMO_KV: KVNamespace
  const JWT_SECRET: string
  const SUPABASE_HOSTNAME: string
  const SUPABASE_ANON_KEY: string
  const SUPABASE_SERVICE_KEY: string
}

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
    // TODO: check origin matches

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

        if (data.event === 'access_token') {
          supabaseWS.send(
            JSON.stringify({
              ...data,
              payload: {
                ...data.payload,
                access_token: accessToken,
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
  supabaseRequest.headers.set('Origin', url.origin)
  supabaseRequest.headers.set('Authorization', `Bearer ${SUPABASE_ANON_KEY}`)

  if (request.method === 'GET' && url.pathname === '/auth/v1/authorize') {
    const supabaseResponse = await fetch(
      supabaseUrl.toString(),
      supabaseRequest,
    )

    const response = new Response(
      supabaseResponse.clone().body,
      supabaseResponse,
    )

    const location = response.headers.get('location')
    if (location) {
      const locationURL = new URL(location)

      const redirectURI = locationURL.searchParams.get('redirect_uri')
      if (redirectURI) {
        locationURL.searchParams.set(
          'redirect_uri',
          `${url.origin}/supabase/auth/v1/callback`,
        )

        response.headers.set('location', locationURL.toString())
      }
    }

    removeCors(response)
    return response
  }

  if (request.method === 'GET' && url.pathname === '/auth/v1/callback') {
    const supabaseResponse = await fetch(
      supabaseUrl.toString(),
      supabaseRequest,
    )

    const response = new Response(
      supabaseResponse.clone().body,
      supabaseResponse,
    )

    // TODO: once this has been fixed: https://github.com/supabase/supabase/discussions/1192#discussioncomment-848941
    // const location = response.headers.get('location')
    // if (location) {
    //   console.log('location:', location)
    // const locationURL = new URL(location)

    // const redirectURI = locationURL.searchParams.get('redirect_uri')
    // if (redirectURI) {
    //   locationURL.searchParams.set(
    //     'redirect_uri',
    //     `${url.origin}/supabase/auth/v1/callback`,
    //   )

    //   response.headers.set('location', locationURL.toString())
    // }
    // }

    removeCors(response)
    return response
  }

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

      await createSession({
        request,
        sessionId,
        user,
        token,
        expires,
      })

      const cookie = serialize('sb-session-id', sessionId, {
        expires: new Date(expires * 1000),
        path: '/',
        secure: true,
        httpOnly: true,
        sameSite: 'lax',
      })

      response.headers.set('Set-Cookie', cookie)
    }

    removeCors(response)

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

  if (
    request.method === 'DELETE' &&
    url.pathname.startsWith('/edge/v1/sessions/')
  ) {
    if (!session) {
      return new Response(null, { status: 404 })
    }

    const sessionId = url.pathname.slice(18)

    const response = await fetch(
      `https://${SUPABASE_HOSTNAME}/rest/v1/sessions?id=eq.${sessionId}&user_id=eq.${session.user.id}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/vnd.pgrst.object+json',
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      },
    )

    if (response.status !== 200) {
      return new Response(null, { status: 404 })
    }

    const dbSession = (await response.json()) as { id?: string } | undefined

    if (!dbSession?.id) {
      return new Response(null, { status: 404 })
    }

    await deleteSession(dbSession.id)

    return new Response(
      // Filter out token
      JSON.stringify({ id: sessionId }),
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

  const supabaseResponse = await fetch(supabaseUrl.toString(), supabaseRequest)
  // We must copy the response to avoid the "Can't modify immutable headers." error
  const response = new Response(supabaseResponse.body, supabaseResponse)
  removeCors(response)

  if (request.method === 'POST' && url.pathname === '/auth/v1/logout') {
    if (session) {
      await deleteSession(session.id)

      const cookie = serialize('sb-session-id', '', {
        expires: new Date(0),
        path: '/',
        secure: true,
        httpOnly: true,
        sameSite: 'lax',
      })
      response.headers.set('Set-Cookie', cookie)
    }
  }

  return response
}
