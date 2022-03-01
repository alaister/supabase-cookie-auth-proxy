import AuthenticatedLayout from '../../../components/AuthenticatedLayout'
import { NextPageWithLayout } from '../../../lib/types'
import PostShowPage, { getStaticPaths, getStaticProps } from '../../posts/[id]'

export { getStaticPaths, getStaticProps }

const AuthenticatedPostShowPage: NextPageWithLayout = (props) => {
  return <PostShowPage {...props} />
}

AuthenticatedPostShowPage.getLayout = (page) => (
  <AuthenticatedLayout>{page}</AuthenticatedLayout>
)

export default AuthenticatedPostShowPage
