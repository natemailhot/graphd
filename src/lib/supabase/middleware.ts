import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PREVIEW_PATHS = ['/play', '/groups/join']
// Shared "graphd · group · date" result links need their own metadata/OG
// image visible to unauthenticated link-preview crawlers; the page itself
// still shows a sign-in prompt to real signed-out visitors.
const PUBLIC_PREVIEW_PATTERN = /^\/results\/[^/]+\/[^/]+(\/opengraph-image.*)?$/

export async function updateSession(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', request.nextUrl.pathname)

  let supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isPublicPreview =
    PUBLIC_PREVIEW_PATHS.includes(request.nextUrl.pathname) ||
    PUBLIC_PREVIEW_PATTERN.test(request.nextUrl.pathname)

  if (
    !user &&
    !isPublicPreview &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/signup') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/callback') &&
    !request.nextUrl.pathname.startsWith('/how-it-works') &&
    !request.nextUrl.pathname.startsWith('/api/cron') &&
    request.nextUrl.pathname !== '/'
  ) {
    const url = request.nextUrl.clone()
    const redirectTo = request.nextUrl.pathname + request.nextUrl.search
    url.pathname = '/login'
    url.searchParams.set('redirect', redirectTo)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
