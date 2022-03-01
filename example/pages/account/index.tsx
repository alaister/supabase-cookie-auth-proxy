import AuthenticatedLayout from '../../components/AuthenticatedLayout'
import { NextPageWithLayout } from '../../lib/types'

const AccountPage: NextPageWithLayout = () => {
  return (
    <div>
      <h1>Account</h1>
    </div>
  )
}

AccountPage.getLayout = (page) => (
  <AuthenticatedLayout>{page}</AuthenticatedLayout>
)

export default AccountPage
