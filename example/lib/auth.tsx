import { User } from '@supabase/supabase-js'
import { createContext, PropsWithChildren, useContext, useMemo } from 'react'
import { useSessionQuery } from './api/auth'

type AuthContextProps = {
  sessionId: string | null
  user: User | null
  isLoading: boolean
}

export const AuthContext = createContext<AuthContextProps>({
  sessionId: null,
  user: null,
  isLoading: true,
})

type AuthProviderProps = {
  initialSession?: { id: string; user: User } | null
}

export const AuthProvider = ({
  children,
  initialSession = null,
}: PropsWithChildren<AuthProviderProps>) => {
  const { data, isLoading } = useSessionQuery({
    initialData: initialSession ? { session: initialSession } : undefined,
  })

  const value = useMemo(
    () => ({
      sessionId: data?.session?.id ?? null,
      user: data?.session?.user ?? null,
      isLoading,
    }),
    [isLoading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

export const useUser = () => useAuth()?.user ?? null

export const useIsLoggedIn = () => {
  const { isLoading, user } = useAuth()
  if (isLoading) {
    return null
  }

  return user !== null
}
