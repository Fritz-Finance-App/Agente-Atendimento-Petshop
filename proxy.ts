// proxy.ts — Next.js 16 replaced middleware.ts with proxy.ts
// Protects /dashboard routes by verifying the Supabase session cookie.
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const protectedPaths = ['/dashboard']
const publicPaths = ['/login', '/onboarding', '/']

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))
  const isPublic = publicPaths.some((p) => pathname === p || pathname.startsWith(p + '/'))

  // Pass-through for unrelated routes
  if (!isProtected && !isPublic) return NextResponse.next()

  let response = NextResponse.next({ request })

  // Build a Supabase client that can read/write cookies in the proxy context
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isPublic && user && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.(?:png|svg|ico)$).*)'],
}
