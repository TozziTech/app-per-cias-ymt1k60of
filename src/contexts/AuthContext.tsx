import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'

export interface AppUser {
  id: string
  email: string
  name?: string
  role?: string
  avatar_url?: string
}

interface AuthContextType {
  user: AppUser | null
  session: any | null
  login: (email: string, password: string) => Promise<{ error: any }>
  logout: () => Promise<{ error: any }>
  resetPassword: (email: string) => Promise<{ error: any }>
  updatePassword: (password: string) => Promise<{ error: any }>
  updateProfile: (updates: Partial<AppUser>) => Promise<{ error: any }>
  isAuthenticated: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<any | null>(
    pb.authStore.token ? { access_token: pb.authStore.token } : null,
  )
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const mapUser = (record: any): AppUser | null => {
      if (!record) return null
      return {
        id: record.id,
        email: record.email,
        name: record.name,
        avatar_url: record.avatar ? pb.files.getURL(record, record.avatar) : undefined,
        role: record.role || 'user',
      }
    }

    setUser(mapUser(pb.authStore.record))
    setSession(pb.authStore.token ? { access_token: pb.authStore.token } : null)
    setLoading(false)

    const unsubscribe = pb.authStore.onChange((token, record) => {
      setSession(token ? { access_token: token } : null)
      setUser(mapUser(record))
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      await pb.collection('users').authWithPassword(email, password)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const logout = async () => {
    try {
      pb.authStore.clear()
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await pb.collection('users').requestPasswordReset(email)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const updatePassword = async (password: string) => {
    return { error: new Error('Não suportado') }
  }

  const updateProfile = async (updates: Partial<AppUser>) => {
    if (!user) return { error: new Error('Usuário não autenticado') }
    try {
      const record = await pb.collection('users').update(user.id, {
        name: updates.name,
        role: updates.role,
      })
      setUser((prev) => (prev ? { ...prev, name: record.name, role: record.role } : null))
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        user,
        session,
        login,
        logout,
        resetPassword,
        updatePassword,
        updateProfile,
        isAuthenticated: !!user,
        loading,
      },
    },
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
