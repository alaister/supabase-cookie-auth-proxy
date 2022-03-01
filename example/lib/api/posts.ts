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

/* Get Posts */

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

/* Get Post */

export async function getPost(id: string, signal?: AbortSignal) {
  let query = supabase.from<Post>('posts').select(`*`).eq('id', id)

  if (signal) {
    query = query.abortSignal(signal)
  }

  const { data, error } = await query.maybeSingle()

  if (error) {
    throw error
  }

  if (!data) {
    throw new NotFoundError('Post not found')
  }

  return { post: data }
}

type PostData = { post: Post }
type PostError = PostgrestError

export const usePostQuery = (
  id: string,
  options?: UseQueryOptions<PostData, PostError>
) =>
  useQuery<PostData, PostError>(
    ['post', id],
    ({ signal }) => getPost(id, signal),
    options
  )
