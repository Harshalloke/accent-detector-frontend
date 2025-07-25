'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LogOut, User } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js' // Fixed: Proper type import

export default function ProfilePage() {
  const [user, setUser] = useState<SupabaseUser | null>(null) // Fixed: Proper type
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const getUser = useCallback(async () => { // Fixed: Memoized function
    const { data: { session } } = await supabase.auth.getSession()
    setUser(session?.user || null)
    setLoading(false)
  }, [supabase.auth])

  useEffect(() => {
    getUser()
  }, [getUser]) // Fixed: Added proper dependency

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-6 w-6" />
            Profile Settings
          </CardTitle>
          <CardDescription>
            Manage your account information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user?.email || ''}
              disabled
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="created">Member Since</Label>
            <Input
              id="created"
              value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : ''}
              disabled
            />
          </div>

          <div className="pt-4 border-t">
            <Button
              variant="destructive"
              onClick={handleSignOut}
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
