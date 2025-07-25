import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ // Fixed: Use const instead of let
    request: {
      headers: request.headers,
    },
  })

  const supabase = createMiddlewareClient({ req: request, res: response })
  await supabase.auth.getSession()

  return response
}
