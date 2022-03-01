import Link from 'next/link'
import { usePostsQuery } from '../lib/api/posts'

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

export default Posts
