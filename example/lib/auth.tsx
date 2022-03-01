import { User } from '@supabase/supabase-js'
import { createContext, PropsWithChildren, useContext, useMemo } from 'react'
import { useSessionQuery } from './api/auth'

type AuthContextProps = {
  user: User | null
  isLoading: boolean
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  isLoading: true,
})

export const AuthProvider = ({ children }: PropsWithChildren<{}>) => {
  const { data, isLoading } = useSessionQuery()

  const value = useMemo(
    () => ({
      user: data?.session.user ?? null,
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
