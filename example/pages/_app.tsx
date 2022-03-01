import { useState } from 'react'
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query'
import { NotFoundError } from '../lib/api/utils'
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
              if (error instanceof NotFoundError) {
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
        {getLayout(<Component {...pageProps} />)}
      </Hydrate>
    </QueryClientProvider>
  )
}

export default CustomApp
