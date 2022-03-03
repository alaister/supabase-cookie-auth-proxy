import { useEffect } from 'react'
import { useQueryClient } from 'react-query'
import AuthenticatedLayout from '../../components/AuthenticatedLayout'
import Session from '../../components/Session'
import Spinner from '../../components/Spinner'
import { useSessionsQuery } from '../../lib/api/sessions'
import { useIsLoggedIn } from '../../lib/auth'
import supabase from '../../lib/supabase'
import { NextPageWithLayout } from '../../lib/types'

const AccountPage: NextPageWithLayout = () => {
  const queryClient = useQueryClient()
  const isLoggedIn = useIsLoggedIn()

  const { data, isLoading } = useSessionsQuery()

  useEffect(() => {
    const subscription = supabase
      .from(`sessions`)
      .on('*', (payload) => {
        queryClient.setQueriesData(['sessions'], (oldData: any) => {
          const update = (entity: any) => {
            if (payload.eventType === 'INSERT') {
              return {
                sessions: [payload.new, ...entity.sessions],
              }
            }

            if (payload.eventType === 'DELETE') {
              return {
                sessions: entity.sessions.filter(
                  (session: any) => session.id !== payload.old.id
                ),
              }
            }

            return entity
          }

          return Array.isArray(oldData) ? oldData.map(update) : update(oldData)
        })
      })
      .subscribe()

    return () => {
      supabase.removeSubscription(subscription)
    }
    // Re-run on login changes
  }, [isLoggedIn])

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
