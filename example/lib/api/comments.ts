import { PostgrestError } from '@supabase/supabase-js'
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query'
import supabase from '../supabase'
import { NotFoundError } from './utils'

type Comment = {
  id: string
  created_at: string
  user_id: string
  post_id: string
  body: string
}

/* Get Comments */

export async function getCommentsForPost(postId: string, signal?: AbortSignal) {
  let query = supabase
    .from<Comment>('comments')
    .select(`*`)
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (signal) {
    query = query.abortSignal(signal)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  if (!data) {
    throw new NotFoundError('Comments not found')
  }

  return { comments: data }
}

type CommentsData = { comments: Comment[] }
type CommentsError = PostgrestError

export const useCommentsForPostQuery = (
  postId: string,
  options?: UseQueryOptions<CommentsData, CommentsError>
) =>
  useQuery<CommentsData, CommentsError>(
    ['comments', postId],
    ({ signal }) => getCommentsForPost(postId, signal),
    options
  )

/* Create Comment */

type CreateCommentData = { comment: Comment }
type CreateCommentVariables = { postId: string; body: string }

export async function createComment({ postId, body }: CreateCommentVariables) {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      body,
    })
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return { comment: data as Comment }
}

export const useCreateCommentMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<CreateCommentData, PostgrestError, CreateCommentVariables>(
    ({ postId, body }) => createComment({ postId, body }),
    {
      async onSuccess({ comment }) {
        await queryClient.invalidateQueries(['comments', comment.post_id])
      },
    }
  )
}
