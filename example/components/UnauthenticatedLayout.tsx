import Link from 'next/link'
import { PropsWithChildren } from 'react'

const UnauthenticatedLayout = ({ children }: PropsWithChildren<{}>) => {
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
            <Link href="/signin">
              <a>Sign In</a>
            </Link>

            <Link href="/signup">
              <a>Sign Up</a>
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

export default UnauthenticatedLayout
