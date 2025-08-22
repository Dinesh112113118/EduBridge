import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ExternalLink,
  FileText,
  CheckCircle2,
  Edit3,
  Save,
  X
} from 'lucide-react'
import { Submission } from '@/lib/mockData'

interface SubmissionDetailModalProps {
  submission: Submission | null
  isOpen: boolean
  onClose: () => void
  onApprove?: (submissionId: string, adjustedScore?: number) => void
  onReject?: (submissionId: string) => void
}

export const SubmissionDetailModal: React.FC<SubmissionDetailModalProps> = ({
  submission,
  isOpen,
  onClose,
  onApprove,
  onReject
}) => {
  const [isEditingScore, setIsEditingScore] = useState(false)
  const [adjustedScore, setAdjustedScore] = useState(submission?.ai_score || 0)

  if (!submission) return null

  const handleApprove = () => {
    const scoreToUse = isEditingScore ? adjustedScore : submission.ai_score
    onApprove?.(submission.id, scoreToUse || undefined)
    onClose()
  }

  const handleScoreEdit = () => {
    setIsEditingScore(true)
    setAdjustedScore(submission.ai_score || 0)
  }

  const handleScoreSave = () => {
    setIsEditingScore(false)
    // In real app, this would update the submission
  }

  const handleScoreCancel = () => {
    setIsEditingScore(false)
    setAdjustedScore(submission.ai_score || 0)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>{submission.file_name}</span>
          </DialogTitle>
          <DialogDescription>
            Submitted by {submission.student_name} on{' '}
            {new Date(submission.created_at).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* File Link */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Assignment File</Label>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" asChild>
                <a href={submission.file_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View File
                </a>
              </Button>
              <Badge variant="secondary" className="text-xs">
                {submission.file_name.split('.').pop()?.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* AI Analysis */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">AI Analysis Results</h3>
            
            {/* Score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">AI Score (Editable)</Label>
                {!isEditingScore && (
                  <Button variant="outline" size="sm" onClick={handleScoreEdit}>
                    <Edit3 className="h-3 w-3 mr-1" />
                    Edit Score
                  </Button>
                )}
              </div>
              
              {isEditingScore ? (
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={adjustedScore}
                    onChange={(e) => setAdjustedScore(parseInt(e.target.value) || 0)}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                  <Button variant="ghost" size="sm" onClick={handleScoreSave}>
                    <Save className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleScoreCancel}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Progress value={adjustedScore} className="flex-1" />
                  <span className={`text-lg font-bold w-16 ${
                    adjustedScore >= 85 ? 'text-secondary' :
                    adjustedScore >= 70 ? 'text-primary' :
                    'text-destructive'
                  }`}>
                    {adjustedScore}%
                  </span>
                </div>
              )}
            </div>

            {/* Weak Topics */}
            {submission.weak_topics.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Areas for Improvement</Label>
                <div className="flex flex-wrap gap-2">
                  {submission.weak_topics.map((topic) => (
                    <Badge key={topic} variant="outline" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Resources */}
            {submission.recommended_resources.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">AI Recommended Resources</Label>
                <div className="space-y-2 bg-muted/50 rounded-lg p-3">
                  {submission.recommended_resources.map((resource, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {resource.type}
                        </Badge>
                        <span className="text-sm">{resource.title}</span>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Current Status */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Current Status</Label>
            <div className="flex items-center space-x-2">
              {submission.teacher_approved ? (
                <Badge className="bg-secondary/10 text-secondary border-secondary/20">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Approved
                </Badge>
              ) : (
                <Badge variant="outline" className="border-accent text-accent">
                  Awaiting Review
                </Badge>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {!submission.teacher_approved && (
            <>
              <Button
                variant="destructive"
                onClick={() => onReject?.(submission.id)}
                className="w-full sm:w-auto"
              >
                Reject
              </Button>
              <Button
                onClick={handleApprove}
                className="w-full sm:w-auto bg-secondary hover:bg-secondary/90"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approve {isEditingScore ? 'with Adjusted Score' : ''}
              </Button>
            </>
          )}
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}