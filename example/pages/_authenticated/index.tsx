import AuthenticatedLayout from '../../components/AuthenticatedLayout'
import { NextPageWithLayout } from '../../lib/types'
import IndexPage, { getStaticProps } from '../index'

export { getStaticProps }

const AuthenticatedIndexPage: NextPageWithLayout = (props) => {
  return <IndexPage {...props} />
}

AuthenticatedIndexPage.getLayout = (page) => (
  <AuthenticatedLayout>{page}</AuthenticatedLayout>
)

export default AuthenticatedIndexPage
