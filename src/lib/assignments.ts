import { supabase } from './supabase'

export interface Assignment {
  id: string
  user_id: string
  title: string
  description?: string
  file_url?: string
  file_name?: string
  file_size?: number
  status: 'pending' | 'analyzed' | 'reviewed'
  ai_feedback?: string
  teacher_feedback?: string
  score?: number
  created_at: string
  updated_at: string
}

// Google API configuration
const GOOGLE_API_KEY = 'AIzaSyCPUcCMklEut1B4PSSVgO9g1YdOSptAS0E'

// Function to upload file to Supabase Storage
export const uploadAssignmentFile = async (
  file: File,
  userId: string
): Promise<{ fileUrl: string; fileName: string; fileSize: number } | null> => {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from('assignments')
      .upload(fileName, file)

    if (error) {
      console.error('Error uploading file:', error)
      return null
    }

    const { data: { publicUrl } } = supabase.storage
      .from('assignments')
      .getPublicUrl(fileName)

    return {
      fileUrl: publicUrl,
      fileName: file.name,
      fileSize: file.size
    }
  } catch (error) {
    console.error('Error in uploadAssignmentFile:', error)
    return null
  }
}

// Function to create a new assignment
export const createAssignment = async (
  assignment: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>
): Promise<Assignment | null> => {
  try {
    const { data, error } = await supabase
      .from('assignments')
      .insert(assignment)
      .select()
      .single()

    if (error) {
      console.error('Error creating assignment:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in createAssignment:', error)
    return null
  }
}

// Function to get assignments for a user
export const getUserAssignments = async (userId: string): Promise<Assignment[]> => {
  try {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching assignments:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getUserAssignments:', error)
    return []
  }
}

// Function to get all assignments (for teachers)
export const getAllAssignments = async (): Promise<Assignment[]> => {
  try {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching all assignments:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getAllAssignments:', error)
    return []
  }
}

// Function to update assignment
export const updateAssignment = async (
  id: string,
  updates: Partial<Assignment>
): Promise<Assignment | null> => {
  try {
    const { data, error } = await supabase
      .from('assignments')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating assignment:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in updateAssignment:', error)
    return null
  }
}

// Function to analyze assignment using Google AI (placeholder for now)
export const analyzeAssignment = async (
  assignmentId: string,
  fileUrl: string
): Promise<{ feedback: string; score: number } | null> => {
  try {
    // This is a placeholder implementation
    // In a real application, you would:
    // 1. Download the file from fileUrl
    // 2. Extract text content
    // 3. Send to Google AI API for analysis
    // 4. Return structured feedback and score

    // Simulated analysis for now
    const feedback = `This is a sample AI analysis for assignment ${assignmentId}. 
    The content appears to be well-structured and demonstrates good understanding of the subject matter. 
    Consider expanding on key points and providing more specific examples to strengthen your arguments.`
    
    const score = Math.floor(Math.random() * 30) + 70 // Random score between 70-100

    return { feedback, score }
  } catch (error) {
    console.error('Error in analyzeAssignment:', error)
    return null
  }
}

// Function to delete assignment
export const deleteAssignment = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting assignment:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in deleteAssignment:', error)
    return false
  }
}
