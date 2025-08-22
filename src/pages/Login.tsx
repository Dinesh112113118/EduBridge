import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GraduationCap, BookOpen, Users, User, UserCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

const Login = () => {
  const { user, userProfile, signInDemo } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user && userProfile) {
      if (userProfile.role === 'teacher') {
        navigate('/teacher')
      } else {
        navigate('/student')
      }
    }
  }, [user, userProfile, navigate])

  const handleDemoLogin = async (role: 'student' | 'teacher') => {
    setIsLoading(true)
    try {
      await signInDemo(role)
      toast.success(`Welcome! Logged in as ${role}`)
    } catch (error) {
      console.error('Demo login error:', error)
      toast.error('Failed to login with demo account')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                EduBridge AI
              </h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Intelligent Assessment & Learning Platform
            </p>
            <p className="text-lg text-foreground/80">
              Upload your assignments, get AI-powered feedback, and track your academic progress with personalized recommendations.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex items-center space-x-3 p-4 rounded-lg bg-card/50 border border-border/50"
            >
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-medium">Smart Analysis</h3>
                <p className="text-sm text-muted-foreground">AI-powered feedback on your work</p>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center space-x-3 p-4 rounded-lg bg-card/50 border border-border/50"
            >
              <Users className="h-5 w-5 text-secondary" />
              <div>
                <h3 className="font-medium">Teacher Oversight</h3>
                <p className="text-sm text-muted-foreground">Human validation of AI assessments</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right side - Demo Auth Only */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-md mx-auto space-y-6"
        >
          <Card className="educational-card">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Demo Login
              </CardTitle>
              <CardDescription>
                Quick access for hackathon demonstration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => handleDemoLogin('student')}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <User className="h-4 w-4 mr-2" />
                Login as Student
              </Button>
              <Button 
                onClick={() => handleDemoLogin('teacher')}
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Login as Teacher
              </Button>
              <div className="text-xs text-muted-foreground text-center pt-2">
                Demo only. No external auth required.
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default Login