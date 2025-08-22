import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Upload, File, CheckCircle2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface FileUploadProps {
  onUploadComplete?: (file: File) => void
  acceptedTypes?: string[]
  maxSize?: number // in MB
  isProcessing?: boolean
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  acceptedTypes = ['.pdf', '.jpg', '.jpeg', '.png'],
  maxSize = 10,
  isProcessing = false
}) => {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const simulateUpload = async (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100))
      setUploadProgress(i)
    }

    setIsUploading(false)
    setUploadedFile(file)
    onUploadComplete?.(file)
  }

  const handleFileSelect = (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`)
      return
    }

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!acceptedTypes.includes(fileExtension)) {
      alert(`File type not supported. Accepted types: ${acceptedTypes.join(', ')}`)
      return
    }

    simulateUpload(file)
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const resetUpload = () => {
    setUploadedFile(null)
    setUploadProgress(0)
    setIsUploading(false)
  }

  if (uploadedFile) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-4"
      >
        <Card className="educational-card border-secondary/20 bg-secondary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isProcessing ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                ) : (
                  <CheckCircle2 className="h-8 w-8 text-secondary" />
                )}
                <div>
                  <h3 className="font-medium text-secondary">
                    {isProcessing ? 'Processing with AI...' : 'Upload Successful'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isProcessing ? 'LLM is analyzing your submission' : uploadedFile.name}
                  </p>
                </div>
              </div>
              {!isProcessing && (
                <Button variant="ghost" size="sm" onClick={resetUpload}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <Card className={`educational-card border-2 border-dashed transition-all duration-200 ${
      dragActive ? 'border-primary bg-primary/5' : 'border-border/50'
    }`}>
      <CardContent className="p-8">
        <div
          className="text-center space-y-4"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <motion.div
            animate={{ scale: dragActive ? 1.1 : 1 }}
            transition={{ duration: 0.2 }}
            className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center"
          >
            <Upload className={`h-8 w-8 ${dragActive ? 'text-primary' : 'text-muted-foreground'}`} />
          </motion.div>

          <div className="space-y-2">
            <h3 className="font-medium">Upload your assignment</h3>
            <p className="text-sm text-muted-foreground">
              Drag and drop your file here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Supported: {acceptedTypes.join(', ')} • Max {maxSize}MB
            </p>
          </div>

          <div>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept={acceptedTypes.join(',')}
              onChange={handleInputChange}
            />
            <label htmlFor="file-upload">
              <Button asChild variant="outline" className="cursor-pointer">
                <span>
                  <File className="mr-2 h-4 w-4" />
                  Choose File
                </span>
              </Button>
            </label>
          </div>

          <AnimatePresence>
            {isUploading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 pt-4"
              >
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="progress-glow" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  )
}