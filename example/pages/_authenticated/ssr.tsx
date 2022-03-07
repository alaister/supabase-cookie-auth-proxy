import AuthenticatedLayout from '../../components/AuthenticatedLayout'
import { NextPageWithLayout } from '../../lib/types'
import SSRPage, { getServerSideProps } from '../ssr'

export { getServerSideProps }

const AuthenticatedSSRPage: NextPageWithLayout = (props) => {
  return <SSRPage {...props} />
}

AuthenticatedSSRPage.getLayout = (page) => (
  <AuthenticatedLayout>{page}</AuthenticatedLayout>
)

export default AuthenticatedSSRPage
