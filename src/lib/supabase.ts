import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://duvyhxrxexcztuqxkvzd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1dnloeHJ4ZXhjenR1cXhrdnpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTg1NzAwNiwiZXhwIjoyMDcxNDMzMDA2fQ.oOLjuAxna3DZYensMXjmERQapAiE5KJ30Dq2EENdl9A'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type UserRole = 'student' | 'teacher'

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  full_name?: string
  avatar_url?: string
  created_at?: string
  updated_at?: string
}

// Demo user credentials for hackathon demonstration
export const DEMO_USERS = {
  student: {
    email: 'student@demo.com',
    password: 'demo123456',
    role: 'student' as UserRole,
    full_name: 'Demo Student'
  },
  teacher: {
    email: 'teacher@demo.com',
    password: 'demo123456',
    role: 'teacher' as UserRole,
    full_name: 'Demo Teacher'
  }
}

// Function to sign in with demo credentials
export const signInWithDemo = async (role: 'student' | 'teacher') => {
  const demoUser = DEMO_USERS[role]
  
  // 1) Try normal sign-in first
  let { data, error } = await supabase.auth.signInWithPassword({
    email: demoUser.email,
    password: demoUser.password
  })
  if (!error && data?.session) return data

  // 2) Try Admin path to ensure user exists and confirmed
  try {
    await ensureDemoUserExists(role)
    const retry = await supabase.auth.signInWithPassword({
      email: demoUser.email,
      password: demoUser.password
    })
    if (!retry.error && retry.data?.session) return retry.data
  } catch (adminErr) {
    // Continue to public fallback
    console.warn('Admin path failed, trying public signup fallback:', adminErr)
  }

  // 3) Public signup fallback (works if email confirmations are not required)
  try {
    const signUpRes = await supabase.auth.signUp({
      email: demoUser.email,
      password: demoUser.password
    })

    // If user already exists, continue
    if (signUpRes.error && !`${signUpRes.error.message}`.toLowerCase().includes('already registered')) {
      throw signUpRes.error
    }

    const finalTry = await supabase.auth.signInWithPassword({
      email: demoUser.email,
      password: demoUser.password
    })
    if (finalTry.error) throw finalTry.error
    return finalTry.data
  } catch (fallbackErr) {
    console.error('Demo login failed:', fallbackErr)
    throw new Error(
      `Demo login failed. ${
        (fallbackErr as any)?.message || 'Please check Supabase settings or run database-setup.sql.'
      }`
    )
  }
}

// Helper: find a user by email using Admin API listUsers
const findUserByEmail = async (email: string) => {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (error) throw error
  const user = data.users.find(u => u.email?.toLowerCase() === email.toLowerCase())
  return user || null
}

// Ensure demo user exists (Admin API) and profile is set with correct role
export const ensureDemoUserExists = async (role: 'student' | 'teacher') => {
  const demoUser = DEMO_USERS[role]

  let user = await findUserByEmail(demoUser.email)

  if (!user) {
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email: demoUser.email,
      password: demoUser.password,
      email_confirm: true,
      user_metadata: { full_name: demoUser.full_name, role: demoUser.role }
    })
    if (createErr) {
      if (`${createErr.message}`.toLowerCase().includes('already registered')) {
        user = await findUserByEmail(demoUser.email)
      } else {
        throw createErr
      }
    } else {
      user = created.user ?? null
    }
  }

  if (user) {
    await upsertUserProfile({
      id: user.id,
      email: demoUser.email,
      role: demoUser.role,
      full_name: demoUser.full_name
    })
  }

  return user
}

// Function to get user profile from database
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getUserProfile:', error)
    return null
  }
}

// Function to create or update user profile
export const upsertUserProfile = async (profile: Partial<UserProfile>): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(profile, { onConflict: 'id' })
      .select()
      .single()

    if (error) {
      console.error('Error upserting user profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in upsertUserProfile:', error)
    return null
  }
}

// Function to create initial user profile after sign up
export const createInitialUserProfile = async (
  userId: string, 
  email: string, 
  role: UserRole = 'student',
  fullName?: string
): Promise<UserProfile | null> => {
  const profile: Partial<UserProfile> = {
    id: userId,
    email,
    role,
    full_name: fullName || email.split('@')[0],
  }

  return await upsertUserProfile(profile)
}