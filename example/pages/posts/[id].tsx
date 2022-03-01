import DynamicLayout from '../../components/DynamicLayout'
import { NextPageWithLayout } from '../../lib/types'

const PostShowPage: NextPageWithLayout = () => {
  return (
    <div>
      <h1>Post</h1>
    </div>
  )
}

PostShowPage.getLayout = (page) => <DynamicLayout>{page}</DynamicLayout>

export default PostShowPage
