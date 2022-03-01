import { PostgrestError, Session, User } from '@supabase/supabase-js'
import { useMutation, useQueryClient } from 'react-query'
import supabase from '../supabase'
import gravatarUrl from 'gravatar-url'

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

/* SignUp */

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
        name,
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

/* SignOut */

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
