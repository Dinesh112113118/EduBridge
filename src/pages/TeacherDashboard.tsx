import { useMemo, useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { SubmissionDetailModal } from '@/components/SubmissionDetailModal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'
import { 
  Users, 
  TrendingUp, 
  FileText, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Edit3
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useSubmissions } from '@/contexts/SubmissionsContext'
import { Submission } from '@/lib/mockData'

const TeacherDashboard = () => {
  const { submissions, weakTopics, approveSubmission, rejectSubmission, getClassroomStats } = useSubmissions()
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const stats = useMemo(() => getClassroomStats(), [submissions])

  const handleViewSubmission = (submission: Submission) => {
    setSelectedSubmission(submission)
    setIsModalOpen(true)
  }

  const handleApproveSubmission = (submissionId: string, adjustedScore?: number) => {
    approveSubmission(submissionId, adjustedScore)
  }

  const handleRejectSubmission = (submissionId: string) => {
    rejectSubmission(submissionId)
  }

  const getStatusIcon = (status: string, teacherApproved: boolean) => {
    if (status === 'approved' && teacherApproved) {
      return <CheckCircle2 className="h-4 w-4 text-secondary" />
    }
    if (status === 'analyzed' && !teacherApproved) {
      return <AlertTriangle className="h-4 w-4 text-accent" />
    }
    return <Clock className="h-4 w-4 text-muted-foreground" />
  }

  const getStatusBadge = (status: string, teacherApproved: boolean) => {
    if (status === 'approved' && teacherApproved) {
      return <Badge className="bg-secondary/10 text-secondary border-secondary/20">Approved</Badge>
    }
    if (status === 'analyzed' && !teacherApproved) {
      return <Badge variant="outline" className="border-accent text-accent">Needs Review</Badge>
    }
    return <Badge variant="secondary">Processing</Badge>
  }

  const heatmapData = weakTopics.map(topic => ({
    topic: topic.topic,
    count: topic.count,
    percentage: topic.percentage
  }))

  const getBarColor = (percentage: number) => {
    if (percentage >= 30) return 'hsl(var(--destructive))'
    if (percentage >= 20) return 'hsl(var(--accent))'
    if (percentage >= 10) return 'hsl(var(--primary))'
    return 'hsl(var(--secondary))'
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Monitor student progress and review AI assessments
          </p>
        </motion.div>

        {/* Overview Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <Card className="stat-card">
            <CardContent className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold">{stats.averageScore}%</p>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="flex items-center space-x-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Need Improvement</p>
                <p className="text-2xl font-bold">{stats.weakTopicsPercentage}%</p>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="flex items-center space-x-4">
              <div className="p-3 bg-secondary/10 rounded-lg">
                <FileText className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Submissions</p>
                <p className="text-2xl font-bold">{stats.totalSubmissions}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="flex items-center space-x-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{stats.approvedSubmissions}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Weak Topics Heatmap */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-semibold flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Class Weak Topics Overview
          </h2>
          <Card className="educational-card">
            <CardHeader>
              <CardTitle className="text-lg">Topics Requiring Attention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={heatmapData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="topic" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis 
                      label={{ value: 'Students (%)', angle: -90, position: 'insideLeft' }}
                      fontSize={12}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Students Struggling']}
                      labelFormatter={(label) => `Topic: ${label}`}
                    />
                    <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                      {heatmapData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getBarColor(entry.percentage)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Submissions Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Student Submissions
            </h2>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4 text-accent" />
              <span>{submissions.filter(s => s.status === 'analyzed' && !s.teacher_approved).length} awaiting review</span>
            </div>
          </div>
          
          <Card className="educational-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="flex items-center space-x-1">
                    <span>AI Score</span>
                    <Edit3 className="h-3 w-3 text-muted-foreground" />
                  </TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">{submission.student_name}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm">{submission.file_name}</p>
                        {submission.weak_topics.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {submission.weak_topics.slice(0, 2).map((topic) => (
                              <Badge key={topic} variant="outline" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                            {submission.weak_topics.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{submission.weak_topics.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(submission.status, submission.teacher_approved)}
                        {getStatusBadge(submission.status, submission.teacher_approved)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {submission.ai_score ? (
                          <div className="flex items-center space-x-2">
                            <span className={`font-bold text-lg ${
                              submission.ai_score >= 85 ? 'text-secondary' :
                              submission.ai_score >= 70 ? 'text-primary' :
                              'text-destructive'
                            }`}>
                              {submission.ai_score}%
                              {submission.teacher_approved && (
                                <span className="ml-1 text-xs text-muted-foreground">✓</span>
                              )}
                            </span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => {
                                setSelectedSubmission(submission)
                                setIsModalOpen(true)
                              }}
                              className="h-6 w-6 p-0"
                              title="Edit AI Score"
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(submission.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewSubmission(submission)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </motion.div>
      </main>

      {/* Submission Detail Modal */}
      <SubmissionDetailModal
        submission={selectedSubmission}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApprove={handleApproveSubmission}
        onReject={handleRejectSubmission}
      />
    </div>
  )
}

export default TeacherDashboard