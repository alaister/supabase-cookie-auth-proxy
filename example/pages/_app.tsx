import { useState } from 'react'
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query'
import { NotFoundError, UnauthenticatedError } from '../lib/api/utils'
import { AuthProvider } from '../lib/auth'
import { AppPropsWithLayout } from '../lib/types'
import '../styles/globals.css'

const CustomApp = ({ Component, pageProps }: AppPropsWithLayout) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: (failureCount, error) => {
              // Don't retry on 404s
              if (
                error instanceof NotFoundError ||
                error instanceof UnauthenticatedError
              ) {
                return false
              }

              if (failureCount < 3) {
                return true
              }

              return false
            },
          },
        },
      })
  )

  const getLayout = Component.getLayout ?? ((page) => page)

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <AuthProvider>{getLayout(<Component {...pageProps} />)}</AuthProvider>
      </Hydrate>
    </QueryClientProvider>
  )
}

export default CustomApp
