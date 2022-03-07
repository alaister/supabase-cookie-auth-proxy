import { GetServerSideProps } from 'next'
import AuthenticatedLayout from '../../components/AuthenticatedLayout'
import { NextPageWithLayout } from '../../lib/types'
import SSRPage from '../ssr'

// We only need to run getServerSideProps in the _authenticated route,
// because the user will be logged out if they make it to the normal one
export const getServerSideProps: GetServerSideProps = async (context) => {
  const request = new Request(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/edge/v1/session`
  )

  // Forward cookie header
  const cookieHeader = context.req.headers.cookie
  if (cookieHeader) {
    request.headers.set('Cookie', cookieHeader)
  }

  const response = await fetch(request)

  if (response.status !== 200) {
    return {
      props: {
        initialSession: null,
      },
    }
  }

  const session = await response.json()

  return {
    props: {
      initialSession: session,
    },
  }
}

const AuthenticatedSSRPage: NextPageWithLayout = (props) => {
  return <SSRPage {...props} />
}

AuthenticatedSSRPage.getLayout = (page) => (
  <AuthenticatedLayout>{page}</AuthenticatedLayout>
)

export default AuthenticatedSSRPage
