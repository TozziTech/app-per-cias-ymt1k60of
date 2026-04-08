import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Session, User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

export interface AppUser {
  id: string
  email: string
  name?: string
  role?: string
}

interface AuthContextType {
  user: AppUser | null
  session: Session | null
  login: (email: string, password: string) => Promise<{ error: any }>
  logout: () => Promise<{ error: any }>
  isAuthenticated: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      // FORBIDDEN: no async/await inside this callback — sync only
      setSession(newSession)
      if (!newSession) {
        setUser(null)
      }
      setLoading(false)
    })

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession)
      if (!initialSession) {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const loadProfile = async () => {
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (data) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: data.name,
            role: data.role,
          })
        } else {
          // Fallback if profile not found/created yet
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || 'Usuário',
            role: session.user.user_metadata?.role || 'user',
          })
        }
      }
    }

    loadProfile()
  }, [session])

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    return { error }
  }

  return React.createElement(
    AuthContext.Provider,
    { value: { user, session, login, logout, isAuthenticated: !!session, loading } },
    children,
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
