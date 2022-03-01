import Link from 'next/link'
import { useRouter } from 'next/router'
import { PropsWithChildren, useEffect } from 'react'
import { useAuth } from '../lib/auth'

const AuthenticatedLayout = ({ children }: PropsWithChildren<{}>) => {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && user === null) {
      router.push('/signin')
    }
  }, [isLoading, user])

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-8 py-4">
        <nav className="flex items-center justify-between">
          <div>
            <Link href="/">
              <a>Home</a>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/account">
              <a>
                {isLoading
                  ? 'Loading...'
                  : user?.user_metadata.full_name ?? user?.email ?? 'Account'}
              </a>
            </Link>

            <Link href="/signout">
              <a>Sign Out</a>
            </Link>
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
