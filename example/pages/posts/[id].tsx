import { GetStaticPaths, GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { FormEvent, useCallback, useEffect } from 'react'
import {
  dehydrate,
  DehydratedState,
  QueryClient,
  useQueryClient,
} from 'react-query'
import DynamicLayout from '../../components/DynamicLayout'
import {
  useCommentsForPostQuery,
  useCreateCommentMutation,
} from '../../lib/api/comments'
import { getPost, getPosts, usePostQuery } from '../../lib/api/posts'
import { useIsLoggedIn } from '../../lib/auth'
import supabase from '../../lib/supabase'
import { NextPageWithLayout } from '../../lib/types'
import { firstStr } from '../../utils/generic'

export const getStaticPaths: GetStaticPaths = async () => {
  const { posts } = await getPosts()

  return {
    paths: posts.map(({ id }) => ({ params: { id } })),
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps<
  {
    dehydratedState: DehydratedState
  },
  { id: string }
> = async ({ params }) => {
  const { id } = params!
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery(['post', id], ({ signal }) =>
    getPost(id, signal)
  )

  return {
    props: { dehydratedState: dehydrate(queryClient) },
  }
}

const PostShowPage: NextPageWithLayout = () => {
  const router = useRouter()
  const { id } = router.query
  const queryClient = useQueryClient()

  const { data, isLoading } = usePostQuery(firstStr(id))
  const { data: commentsData, isLoading: isLoadingComments } =
    useCommentsForPostQuery(firstStr(id))

  const isLoggedIn = useIsLoggedIn()
  useEffect(() => {
    const subscription = supabase
      .from(`comments:post_id=eq.${firstStr(id)}`)
      .on('*', (payload) => {
        queryClient.setQueriesData(['comments', firstStr(id)], (oldData) => {
          const update = (entity: any) => {
            if (payload.eventType === 'INSERT') {
              return {
                comments: [...entity.comments, payload.new],
              }
            }

            if (payload.eventType === 'UPDATE') {
              return {
                comments: entity.comments.map((comment: any) => {
                  if (comment.id === payload.old.id) {
                    return payload.new
                  }

                  return comment
                }),
              }
            }

            if (payload.eventType === 'DELETE') {
              return {
                comments: entity.comments.filter(
                  (comment: any) => comment.id !== payload.old.id
                ),
              }
            }
          }

          return Array.isArray(oldData) ? oldData.map(update) : update(oldData)
        })
      })
      .subscribe()

    return () => {
      supabase.removeSubscription(subscription)
    }
    // Re-run on login changes
  }, [isLoggedIn])

  const { mutate: createComment } = useCreateCommentMutation()

  const onCreateComment = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      const form = e.currentTarget

      const body = new FormData(form).get('body')?.toString()
      if (!body?.trim()) {
        return alert('Must have a body')
      }

      createComment(
        {
          postId: firstStr(id),
          body,
        },
        {
          async onSuccess({ comment }) {
            await queryClient.invalidateQueries(['comments', comment.post_id])

            form.reset()
          },
        }
      )
    },
    [id, queryClient]
  )

  if (!isLoading && !data) {
    return <div>Post not found</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-bold">
        {isLoading ? 'Loading...' : data?.post.title}
      </h1>

      <hr />

      <div className="space-y-4">
        <h3 className="font-medium">{`Comments${
          commentsData?.comments ? ` (${commentsData.comments.length})` : ''
        }`}</h3>

        <ul>
          {isLoadingComments ? (
            <li>Loading...</li>
          ) : (
            commentsData?.comments.map((comment) => (
              <li key={comment.id}>{comment.body}</li>
            ))
          )}
        </ul>

        {isLoggedIn && (
          <form onSubmit={onCreateComment} className="flex space-x-2">
            <input
              name="body"
              placeholder="Comment"
              required
              type="text"
              className="relative flex-1 block px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            />
            <button
              type="submit"
              className="relative flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Add Comment
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

PostShowPage.getLayout = (page) => <DynamicLayout>{page}</DynamicLayout>

export default PostShowPage
