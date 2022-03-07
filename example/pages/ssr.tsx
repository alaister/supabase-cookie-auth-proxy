import { GetServerSideProps } from 'next'
import DynamicLayout from '../components/DynamicLayout'
import { useAuth } from '../lib/auth'
import { NextPageWithLayout } from '../lib/types'

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

const SSRPage: NextPageWithLayout = () => {
  const auth = useAuth()

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">SSR&apos;d</h2>
      <pre className="p-2 overflow-auto bg-gray-100 rounded">
        <code>{JSON.stringify(auth, null, 2)}</code>
      </pre>
    </div>
  )
}

SSRPage.getLayout = (page) => <DynamicLayout>{page}</DynamicLayout>

export default SSRPage
