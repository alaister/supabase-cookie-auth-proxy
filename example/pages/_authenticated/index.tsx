import AuthenticatedLayout from '../../components/AuthenticatedLayout'
import { NextPageWithLayout } from '../../lib/types'
import IndexPage from '../index'

const AuthenticatedIndexPage: NextPageWithLayout = (props) => {
  return <IndexPage {...props} />
}

AuthenticatedIndexPage.getLayout = (page) => (
  <AuthenticatedLayout>{page}</AuthenticatedLayout>
)

export default AuthenticatedIndexPage
