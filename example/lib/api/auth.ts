import { PostgrestError, Session, User } from '@supabase/supabase-js'
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query'
import supabase from '../supabase'
import gravatarUrl from 'gravatar-url'
import { UnauthenticatedError } from './utils'

/* Current Session */

export async function getSession(
  signal?: AbortSignal
): Promise<{ session: { user: User | null } }> {
  const pathname =
    process.env.NODE_ENV === 'production' ? '/edge/v1/session' : '/auth/v1/user'
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}${pathname}`,
    {
      signal,
      ...(process.env.NODE_ENV !== 'production' && {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
          Authorization: `Bearer ${
            supabase.auth.session()?.access_token ??
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          }`,
        },
      }),
    }
  )

  if (response.status === 401) {
    throw new UnauthenticatedError()
  }

  if (response.status !== 200) {
    return { session: { user: null } }
  }

  const session = await response.json()
  if (process.env.NODE_ENV !== 'production') {
    return { session: { user: session as User } }
  }

  return { session: { user: session.user as User } }
}

type SessionData = { session: { user: User | null } }
type SessionError = PostgrestError

export const useSessionQuery = (
  options?: UseQueryOptions<SessionData, SessionError>
) =>
  useQuery<SessionData, SessionError>(
    ['session'],
    ({ signal }) => getSession(signal),
    options
  )

/* Sign In */

type SignInData = { session: Session | null; user: User | null }
type SignInVariables = { email: string; password: string }

export async function signIn({ email, password }: SignInVariables) {
  const { error, session, user } = await supabase.auth.signIn({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return { session, user }
}

export const useSignInMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<SignInData, PostgrestError, SignInVariables>(
    ({ email, password }) => signIn({ email, password }),
    {
      async onSuccess() {
        await queryClient.resetQueries()
      },
    }
  )
}

/* Sign Up */

type SignUpData = { session: Session | null; user: User | null }
type SignUpVariables = { name: string; email: string; password: string }

export async function signUp({ name, email, password }: SignUpVariables) {
  const { error, session, user } = await supabase.auth.signUp(
    {
      email,
      password,
    },
    {
      data: {
        full_name: name,
        avatar_url: gravatarUrl(email, {
          size: 512,
          rating: 'pg',
          default: 'mm',
        }),
      },
    }
  )

  if (error) {
    throw error
  }

  return { session, user }
}

export const useSignUpMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<SignUpData, PostgrestError, SignUpVariables>(
    ({ name, email, password }) => signUp({ name, email, password }),
    {
      async onSuccess() {
        await queryClient.resetQueries()
      },
    }
  )
}

/* Forgot Password */

type ForgotPasswordData = { success: boolean }
type ForgotPasswordVariables = { email: string }

export async function forgotPassword({ email }: ForgotPasswordVariables) {
  const { success } = await fetch(`/api/auth/forgot-password`, {
    method: 'POST',
    body: JSON.stringify({ email }),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((res) => res.json())

  return { success }
}

export const useForgotPasswordMutation = () => {
  return useMutation<ForgotPasswordData, unknown, ForgotPasswordVariables>(
    ({ email }) => forgotPassword({ email })
  )
}

/* Sign Out */

type SignOutData = void
type SignOutVariables = void

export async function signOut() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}

export const useSignOutMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<SignOutData, PostgrestError, SignOutVariables>(
    () => signOut(),
    {
      async onSuccess() {
        await queryClient.resetQueries()
      },
    }
  )
}
