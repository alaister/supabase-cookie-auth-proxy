import { NextRequest, NextResponse } from 'next/server'

export default async function middleware(req: NextRequest) {
  // If we're arriving here, it means that the first middleware didn't
  // rewrite the request to _authenticated, meaning we're not logged in.

  const url = req.nextUrl.clone()

  url.searchParams.set('next', url.pathname)
  url.pathname = '/signin'

  return NextResponse.redirect(url)
}
