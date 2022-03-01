import Link from 'next/link'
import DynamicLayout from '../components/DynamicLayout'
import { usePostsQuery } from '../lib/api/posts'
import { NextPageWithLayout } from '../lib/types'

const Posts = () => {
  const { data, isLoading } = usePostsQuery()

  if (isLoading) {
    return (
      <ul>
        <li>Loading...</li>
      </ul>
    )
  }

  return (
    <ul>
      {data?.posts.map((post) => (
        <li key={post.id}>
          <Link href={`/posts/${post.id}`}>
            <a>{post.title}</a>
          </Link>
        </li>
      ))}
    </ul>
  )
}

const IndexPage: NextPageWithLayout = () => {
  return (
    <div>
      <h2>Posts</h2>

      <Posts />
    </div>
  )
}

IndexPage.getLayout = (page) => <DynamicLayout>{page}</DynamicLayout>

export default IndexPage
