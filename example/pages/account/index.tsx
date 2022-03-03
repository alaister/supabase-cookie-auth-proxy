import AuthenticatedLayout from '../../components/AuthenticatedLayout'
import Session from '../../components/Session'
import Spinner from '../../components/Spinner'
import { useSessionsQuery } from '../../lib/api/sessions'
import { NextPageWithLayout } from '../../lib/types'

const AccountPage: NextPageWithLayout = () => {
  const { data, isLoading } = useSessionsQuery()

  return (
    <div className="mb-20 space-y-6">
      <h2 className="text-lg font-bold">Sessions</h2>

      <div className="space-y-3">
        {isLoading && (
          <div className="flex items-center justify-center w-full h-24">
            <Spinner />
          </div>
        )}
        {data?.sessions.map((session) => (
          <Session key={session.id} session={session} />
        ))}
      </div>
    </div>
  )
}

AccountPage.getLayout = (page) => (
  <AuthenticatedLayout>{page}</AuthenticatedLayout>
)

export default AccountPage
