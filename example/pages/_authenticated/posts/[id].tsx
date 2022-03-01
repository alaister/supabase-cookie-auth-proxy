import AuthenticatedLayout from '../../../components/AuthenticatedLayout'
import { NextPageWithLayout } from '../../../lib/types'
import PostShowPage from '../posts/[id]'

const AuthenticatedPostShowPage: NextPageWithLayout = (props) => {
  return <PostShowPage {...props} />
}

AuthenticatedPostShowPage.getLayout = (page) => (
  <AuthenticatedLayout>{page}</AuthenticatedLayout>
)

export default AuthenticatedPostShowPage
