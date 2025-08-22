import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { mockSubmissions, mockWeakTopics, Submission } from '@/lib/mockData'
import { supabase } from '@/lib/supabase'

interface SubmissionsContextType {
  submissions: Submission[]
  weakTopics: typeof mockWeakTopics
  approveSubmission: (submissionId: string, adjustedScore?: number) => void
  rejectSubmission: (submissionId: string) => void
  updateSubmission: (partial: Partial<Submission> & { id: string }) => void
  createSubmission: (input: { studentId: string; studentName: string; fileName: string; subject: string; fileUrl?: string }) => void
  getStudentSubmissions: (studentId: string) => Submission[]
  getClassroomStats: () => {
    totalSubmissions: number
    approvedSubmissions: number
    averageScore: number
    weakTopicsPercentage: number
  }
}

const STORAGE_KEY = 'edubridge_submissions'

const SubmissionsContext = createContext<SubmissionsContextType | undefined>(undefined)

export const useSubmissions = () => {
  const ctx = useContext(SubmissionsContext)
  if (!ctx) throw new Error('useSubmissions must be used within SubmissionsProvider')
  return ctx
}

const readFromStorage = (): Submission[] | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Submission[]
    if (!Array.isArray(parsed)) return null
    return parsed
  } catch {
    return null
  }
}

const writeToStorage = (subs: Submission[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subs))
  } catch {
    // ignore storage errors
  }
}

// Map DB row to app Submission
const mapDbToSubmission = (row: any): Submission => ({
  id: row.id,
  student_id: row.student_id,
  student_name: row.student_name || 'Student',
  file_name: row.file_name,
  file_url: row.file_url || '#',
  subject: row.subject || 'General',
  status: row.status,
  ai_score: row.ai_score,
  teacher_approved: row.teacher_approved,
  weak_topics: row.weak_topics || [],
  recommended_resources: row.recommended_resources || [],
  created_at: row.created_at,
  updated_at: row.updated_at,
})

// Map app Submission to DB row
const mapSubmissionToDb = (s: Submission) => ({
  id: s.id,
  student_id: s.student_id,
  student_name: s.student_name,
  file_name: s.file_name,
  file_url: s.file_url,
  subject: s.subject,
  status: s.status,
  ai_score: s.ai_score,
  teacher_approved: s.teacher_approved,
  weak_topics: s.weak_topics,
  recommended_resources: s.recommended_resources,
  created_at: s.created_at,
  updated_at: s.updated_at,
})

export const SubmissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [submissions, setSubmissions] = useState<Submission[]>(() => readFromStorage() ?? [...mockSubmissions])

  // On mount: try to pull from Supabase to override local if available
  useEffect(() => {
    const loadFromSupabase = async () => {
      try {
        const { data, error } = await supabase
          .from('submissions')
          .select('*')
          .order('created_at', { ascending: false })

        if (!error && Array.isArray(data) && data.length) {
          const mapped = data.map(mapDbToSubmission)
          setSubmissions(mapped)
        }
      } catch {
        // ignore network/db errors; local persists
      }
    }
    loadFromSupabase()
  }, [])

  // Persist to localStorage on change
  useEffect(() => {
    writeToStorage(submissions)
  }, [submissions])

  // Cross-tab sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as Submission[]
          if (Array.isArray(parsed)) {
            setSubmissions(parsed)
          }
        } catch {
          // ignore
        }
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Mirror changes to Supabase
  const pushToSupabase = async (next: Submission[]) => {
    try {
      const rows = next.map(mapSubmissionToDb)
      // Upsert all; relies on RLS allowing student insert/update and teacher update
      await supabase.from('submissions').upsert(rows, { onConflict: 'id' })
    } catch {
      // ignore on demo; local still works
    }
  }

  const approveSubmission = (submissionId: string, adjustedScore?: number) => {
    setSubmissions(prev => {
      const next = prev.map(s => s.id === submissionId ? {
        ...s,
        status: 'approved',
        teacher_approved: true,
        ai_score: adjustedScore ?? s.ai_score ?? 0,
        updated_at: new Date().toISOString()
      } : s)
      pushToSupabase(next)
      return next
    })
  }

  const rejectSubmission = (submissionId: string) => {
    setSubmissions(prev => {
      const next = prev.map(s => s.id === submissionId ? {
        ...s,
        status: 'rejected',
        teacher_approved: false,
        updated_at: new Date().toISOString()
      } : s)
      pushToSupabase(next)
      return next
    })
  }

  const updateSubmission = (partial: Partial<Submission> & { id: string }) => {
    setSubmissions(prev => {
      const next = prev.map(s => s.id === partial.id ? { ...s, ...partial, updated_at: new Date().toISOString() } : s)
      pushToSupabase(next)
      return next
    })
  }

  const createSubmission = (input: { studentId: string; studentName: string; fileName: string; subject: string; fileUrl?: string }) => {
    const newSubmission: Submission = {
      id: `sub-${Date.now()}`,
      student_id: input.studentId,
      student_name: input.studentName,
      file_name: input.fileName,
      file_url: input.fileUrl || '#',
      subject: input.subject,
      status: 'analyzed',
      ai_score: Math.floor(60 + Math.random() * 40),
      teacher_approved: false,
      weak_topics: [],
      recommended_resources: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setSubmissions(prev => {
      const next = [newSubmission, ...prev]
      pushToSupabase(next)
      return next
    })
  }

  const getStudentSubmissions = (studentId: string) => submissions.filter(s => s.student_id === studentId)

  const getClassroomStats = () => {
    const totalSubmissions = submissions.length
    const approvedSubmissions = submissions.filter(sub => sub.teacher_approved).length
    const scored = submissions.filter(sub => sub.ai_score !== null)
    const averageScore = scored.length ? Math.round(scored.reduce((acc, sub) => acc + (sub.ai_score || 0), 0) / scored.length) : 0
    const weakTopicsPercentage = Math.round((submissions.filter(sub => sub.weak_topics.length > 0).length / (totalSubmissions || 1)) * 100)

    return {
      totalSubmissions,
      approvedSubmissions,
      averageScore,
      weakTopicsPercentage,
    }
  }

  const value = useMemo(() => ({
    submissions,
    weakTopics: mockWeakTopics,
    approveSubmission,
    rejectSubmission,
    updateSubmission,
    createSubmission,
    getStudentSubmissions,
    getClassroomStats
  }), [submissions])

  return (
    <SubmissionsContext.Provider value={value}>
      {children}
    </SubmissionsContext.Provider>
  )
}
