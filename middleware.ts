import { updateSession } from './lib/supabase/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'


export async function middleware(request: NextRequest) {
  const response = await updateSession(request)
  
  const protectedRoutes = ['/dashboard', '/detect', '/profile']
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute) {
    const supabase = createMiddlewareClient({ req: request, res: response })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
