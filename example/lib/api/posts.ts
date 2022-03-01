import { PostgrestError } from '@supabase/supabase-js'
import { useQuery, UseQueryOptions } from 'react-query'
import supabase from '../supabase'
import { NotFoundError } from './utils'

type Post = {
  id: string
  created_at: string
  title: string
  public: boolean
}

export async function getPosts(signal?: AbortSignal) {
  let query = supabase.from<Post>('posts').select(`*`)

  if (signal) {
    query = query.abortSignal(signal)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  if (!data) {
    throw new NotFoundError('Posts not found')
  }

  return { posts: data }
}

type PostsData = { posts: Post[] }
type PostsError = PostgrestError

export const usePostsQuery = (
  options?: UseQueryOptions<PostsData, PostsError>
) =>
  useQuery<PostsData, PostsError>(
    ['posts'],
    ({ signal }) => getPosts(signal),
    options
  )
