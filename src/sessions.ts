import { parse } from 'cookie'
import { Session, User, Without } from './types'

export async function getSession(cookiesStr?: string | null) {
  if (cookiesStr) {
    const cookies = parse(cookiesStr)
    const sessionId = cookies['sb-session-id']
    if (sessionId) {
      const session = await WORKERS_DEMO_KV.get<Without<Session, 'id'>>(
        sessionId,
        'json',
      )
      if (session) {
        return { id: sessionId, ...session }
      }
    }
  }
}

type CreateSessionOptions = {
  sessionId: string
  user: User
  token: string
  request: Request
  expires: number
}

export async function createSession({
  request,
  sessionId,
  user,
  token,
  expires,
}: CreateSessionOptions) {
  await Promise.all([
    WORKERS_DEMO_KV.put(
      sessionId,
      JSON.stringify({
        user,
        token,
      }),
      {
        expiration: expires,
      },
    ),
    fetch(`https://${SUPABASE_HOSTNAME}/rest/v1/sessions`, {
      method: 'POST',
      body: JSON.stringify({
        id: sessionId,
        user_id: user.id,
        expires_at: new Date(expires * 1000).toISOString(),
        ip: request.headers.get('CF-Connecting-IP'),
        user_agent: request.headers.get('User-Agent'),
        country: request.cf?.country ?? null,
      }),
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    }),
  ])
}

export async function deleteSession(sessionId: string) {
  await Promise.all([
    WORKERS_DEMO_KV.delete(sessionId),
    fetch(`https://${SUPABASE_HOSTNAME}/rest/v1/sessions?id=eq.${sessionId}`, {
      method: 'DELETE',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    }),
  ])
}
