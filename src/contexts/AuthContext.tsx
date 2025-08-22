import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, UserProfile } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
  signInDemo: (role: 'student' | 'teacher') => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

const DEMO_MODE = true

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (DEMO_MODE) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user || null
      setUser(currentUser)

      if (!currentUser) {
        setUserProfile(null)
      } else {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single()
        if (error) {
          setUserProfile(null)
        } else {
          setUserProfile(data)
        }
      }

      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (DEMO_MODE) return
      const currentUser = session?.user || null
      setUser(currentUser)

      if (!currentUser) {
        setUserProfile(null)
      } else {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single()
        if (error) {
          setUserProfile(null)
        } else {
          setUserProfile(data)
        }
      }

      setLoading(false)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    if (!DEMO_MODE) {
      await supabase.auth.signOut()
    }
    setUser(null)
    setUserProfile(null)
  }

  const signInDemo = async (role: 'student' | 'teacher') => {
    const email = role === 'teacher' ? 'teacher@demo.com' : 'student@demo.com'
    const full_name = role === 'teacher' ? 'Demo Teacher' : 'Demo Student'

    const fakeUser = {
      id: role === 'teacher' ? 'teacher-1' : 'student-1',
      email,
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as unknown as User

    const profile: UserProfile = {
      id: fakeUser.id,
      email,
      role,
      full_name,
    }

    setUser(fakeUser)
    setUserProfile(profile)
  }

  const value = {
    user,
    userProfile,
    loading,
    signOut,
    signInDemo
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}