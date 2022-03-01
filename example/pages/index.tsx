import { GetStaticProps } from 'next'
import { dehydrate, DehydratedState, QueryClient } from 'react-query'
import DynamicLayout from '../components/DynamicLayout'
import Posts from '../components/Posts'
import { getPosts } from '../lib/api/posts'
import { NextPageWithLayout } from '../lib/types'

export const getStaticProps: GetStaticProps<{
  dehydratedState: DehydratedState
}> = async () => {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery(['posts'], ({ signal }) => getPosts(signal))

  return {
    props: { dehydratedState: dehydrate(queryClient) },
  }
}

const IndexPage: NextPageWithLayout = () => {
  return (
    <div>
      <h2 className="text-lg font-bold">Posts</h2>

      <Posts />
    </div>
  )
}

IndexPage.getLayout = (page) => <DynamicLayout>{page}</DynamicLayout>

export default IndexPage
