import Link from 'next/link'
import { useRouter } from 'next/router'
import { PropsWithChildren, useCallback, useEffect } from 'react'
import { useSignOutMutation } from '../lib/api/auth'
import { useAuth } from '../lib/auth'
import Avatar from './Avatar'

const AuthenticatedLayout = ({ children }: PropsWithChildren<{}>) => {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && user === null) {
      router.push('/signin')
    }
  }, [isLoading, user])

  const { mutate: signOut } = useSignOutMutation()
  const onSignOut = useCallback(() => {
    signOut()
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 py-4 md:px-8">
        <nav className="flex items-center justify-between">
          <div>
            <Link href="/">
              <a>Home</a>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/account">
              <a className="inline-flex items-center">
                <Avatar
                  name={user?.user_metadata.full_name}
                  avatarUrl={user?.user_metadata.avatar_url}
                />
                <span className="ml-2">
                  {isLoading
                    ? 'Loading...'
                    : user?.user_metadata.full_name ?? user?.email ?? 'Account'}
                </span>
              </a>
            </Link>

            <button onClick={onSignOut}>Sign Out</button>
          </div>
        </nav>
      </header>

      <main className="flex flex-col flex-1 w-full max-w-3xl px-4 mx-auto">
        {children}
      </main>

      <footer className="flex w-full h-12 px-4 border-t">
        <a
          className="flex items-center justify-center gap-2"
          href="https://www.alaisteryoung.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          &copy; Alaister Young
        </a>
      </footer>
    </div>
  )
}

export default AuthenticatedLayout
