export interface Submission {
  id: string
  student_id: string
  student_name: string
  file_name: string
  file_url: string
  subject: string
  status: 'pending' | 'analyzed' | 'approved' | 'rejected'
  ai_score: number | null
  teacher_approved: boolean
  weak_topics: string[]
  recommended_resources: Resource[]
  created_at: string
  updated_at: string
}

export interface Resource {
  title: string
  url: string
  type: 'video' | 'article' | 'exercise' | 'tutorial'
}

export interface WeakTopic {
  topic: string
  count: number
  percentage: number
}

export const mockSubmissions: Submission[] = [
  {
    id: 'sub-1',
    student_id: 'student-1',
    student_name: 'Alex Johnson',
    file_name: 'calculus_homework_ch3.pdf',
    file_url: '#',
    subject: 'Mathematics',
    status: 'approved',
    ai_score: 85,
    teacher_approved: true,
    weak_topics: ['Derivatives', 'Chain Rule'],
    recommended_resources: [
      {
        title: 'Khan Academy: Derivatives',
        url: 'https://khanacademy.org/derivatives',
        type: 'video'
      },
      {
        title: 'Chain Rule Practice Problems',
        url: 'https://example.com/chain-rule',
        type: 'exercise'
      }
    ],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T14:30:00Z'
  },
  {
    id: 'sub-2',
    student_id: 'student-1',
    student_name: 'Alex Johnson',
    file_name: 'physics_lab_report.pdf',
    file_url: '#',
    subject: 'Physics',
    status: 'analyzed',
    ai_score: 78,
    teacher_approved: false,
    weak_topics: ['Scientific Method', 'Data Analysis'],
    recommended_resources: [
      {
        title: 'Scientific Method Guide',
        url: 'https://example.com/scientific-method',
        type: 'article'
      }
    ],
    created_at: '2024-01-14T09:00:00Z',
    updated_at: '2024-01-14T11:45:00Z'
  },
  {
    id: 'sub-3',
    student_id: 'student-2',
    student_name: 'Emma Chen',
    file_name: 'chemistry_quiz.jpg',
    file_url: '#',
    subject: 'Chemistry',
    status: 'pending',
    ai_score: null,
    teacher_approved: false,
    weak_topics: [],
    recommended_resources: [],
    created_at: '2024-01-13T15:30:00Z',
    updated_at: '2024-01-13T15:30:00Z'
  },
  {
    id: 'sub-4',
    student_id: 'student-3',
    student_name: 'Michael Rodriguez',
    file_name: 'english_essay.pdf',
    file_url: '#',
    subject: 'English',
    status: 'approved',
    ai_score: 92,
    teacher_approved: true,
    weak_topics: ['Grammar', 'Transitions'],
    recommended_resources: [
      {
        title: 'Grammar Checker Tool',
        url: 'https://example.com/grammar',
        type: 'tutorial'
      }
    ],
    created_at: '2024-01-12T12:00:00Z',
    updated_at: '2024-01-12T16:20:00Z'
  }
]

export const mockWeakTopics: WeakTopic[] = [
  { topic: 'Derivatives', count: 8, percentage: 32 },
  { topic: 'Grammar', count: 6, percentage: 24 },
  { topic: 'Data Analysis', count: 5, percentage: 20 },
  { topic: 'Scientific Method', count: 4, percentage: 16 },
  { topic: 'Chain Rule', count: 3, percentage: 12 },
  { topic: 'Transitions', count: 2, percentage: 8 }
]

export const getStudentSubmissions = (studentId: string): Submission[] => {
  return mockSubmissions.filter(sub => sub.student_id === studentId)
}

export const getTeacherSubmissions = (): Submission[] => {
  return mockSubmissions
}

export const getClassroomStats = () => {
  const totalSubmissions = mockSubmissions.length
  const approvedSubmissions = mockSubmissions.filter(sub => sub.teacher_approved).length
  const averageScore = mockSubmissions
    .filter(sub => sub.ai_score !== null)
    .reduce((acc, sub) => acc + (sub.ai_score || 0), 0) / 
    mockSubmissions.filter(sub => sub.ai_score !== null).length

  const weakTopicsPercentage = (mockSubmissions
    .filter(sub => sub.weak_topics.length > 0).length / totalSubmissions) * 100

  return {
    totalSubmissions,
    approvedSubmissions,
    averageScore: Math.round(averageScore),
    weakTopicsPercentage: Math.round(weakTopicsPercentage)
  }
}