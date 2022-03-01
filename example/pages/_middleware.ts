import { NextRequest, NextResponse } from 'next/server'

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone()
  const { pathname } = req.nextUrl

  if (pathname.startsWith(`/_authenticated`)) {
    return new Response(null, { status: 404 })
  }

  const cookieHeader = req.headers.get('cookie')
  if (!cookieHeader) {
    return NextResponse.next()
  }

  const { status } = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/edge/v1/session`,
    {
      headers: {
        cookie: cookieHeader,
      },
    }
  )

  if (status === 200) {
    url.pathname = `/_authenticated${pathname}`
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}
