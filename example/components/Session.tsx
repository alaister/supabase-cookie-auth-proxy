import countryCodeEmoji from 'country-code-emoji'
import { useCallback, useMemo } from 'react'
import parser from 'ua-parser-js'
import {
  Session as SessionType,
  useRevokeSessionMutation,
} from '../lib/api/sessions'
import { useAuth } from '../lib/auth'

const Session = ({ session }: { session: SessionType }) => {
  const { sessionId } = useAuth()

  const createdAt = useMemo(() => {
    return new Date(session.created_at).toLocaleString(undefined, {
      dateStyle: 'long',
      timeStyle: 'long',
    })
  }, [session])
  const userAgent = useMemo(() => {
    if (!session.user_agent) {
      return null
    }

    return parser(session.user_agent)
  }, [])
  const isCurrentSession = session.id === sessionId

  const { mutate: revokeSession } = useRevokeSessionMutation()
  const onRevokeSession = useCallback(() => {
    revokeSession(session.id)
  }, [])

  return (
    <div className="flex flex-col items-start justify-between p-4 space-y-4 border rounded-lg shadow-lg border-gray-50 md:flex-row md:space-y-0">
      <div className="flex flex-col space-y-2">
        <div className="flex flex-col">
          <span className="text-xs font-medium tracking-wide text-gray-600 uppercase">
            Signed in
          </span>
          <div className="flex items-center">
            {session.country && (
              <span
                className="mr-2 text-2xl cursor-default"
                title={session.country}
              >
                {countryCodeEmoji(session.country)}
              </span>
            )}

            <span>{createdAt}</span>
          </div>
        </div>

        <div className="flex flex-col">
          <span className="text-xs font-medium tracking-wide text-gray-600 uppercase">
            Device
          </span>
          {userAgent === null
            ? 'Unknown'
            : `${userAgent.browser.name} ${userAgent.browser.major} on ${userAgent.os.name}`}
        </div>

        {session.ip && (
          <div className="flex flex-col">
            <span className="text-xs font-medium tracking-wide text-gray-600 uppercase">
              IP Address
            </span>
            {session.ip}
          </div>
        )}
      </div>

      <button
        className="w-full px-4 py-2 text-sm font-medium border-2 border-gray-200 rounded-md group hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-200 md:w-auto"
        onClick={onRevokeSession}
      >
        {isCurrentSession ? 'Sign Out' : 'Revoke'}
      </button>
    </div>
  )
}

export default Session
