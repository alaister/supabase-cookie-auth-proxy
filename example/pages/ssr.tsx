import DynamicLayout from '../components/DynamicLayout'
import { useAuth } from '../lib/auth'
import { NextPageWithLayout } from '../lib/types'

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
