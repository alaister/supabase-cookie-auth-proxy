import { PostgrestError } from '@supabase/supabase-js'
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query'
import { useAuth } from '../auth'
import supabase from '../supabase'
import { NotFoundError } from './utils'

export type Session = {
  id: string
  created_at: string
  expires_at: string
  user_id: string
  ip: string | null
  country: string | null
  user_agent: string | null
}

/* Get Sessions */

export async function getSessions(signal?: AbortSignal) {
  let query = supabase
    .from<Session>('sessions')
    .select(`*`)
    .order('created_at', { ascending: false })

  if (signal) {
    query = query.abortSignal(signal)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  if (!data) {
    throw new NotFoundError('Sessions not found')
  }

  return { sessions: data }
}

type SessionsData = { sessions: Session[] }
type SessionsError = PostgrestError

export const useSessionsQuery = (
  options?: UseQueryOptions<SessionsData, SessionsError>
) =>
  useQuery<SessionsData, SessionsError>(
    ['sessions'],
    ({ signal }) => getSessions(signal),
    options
  )

/* Revoke Session */

export async function revokeSession(id: string, signal?: AbortSignal) {
  await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/edge/v1/sessions/${id}`,
    {
      method: 'DELETE',
      signal,
    }
  )

  return id
}

type RevokeSessionData = string
type RevokeSessionVariables = string

export const useRevokeSessionMutation = () => {
  const queryClient = useQueryClient()
  const { sessionId } = useAuth()

  return useMutation<RevokeSessionData, PostgrestError, RevokeSessionVariables>(
    (id) => revokeSession(id),
    {
      async onSuccess(id) {
        if (sessionId === id) {
          // We're essentially signing out here
          await queryClient.resetQueries()
        } else {
          await queryClient.invalidateQueries(['sessions'])
        }
      },
    }
  )
}
