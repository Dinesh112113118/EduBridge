# EduBridge AI - Supabase Setup Guide

## 🚀 Quick Start for Hackathon Demo

### 1. Supabase Configuration
The application is already configured with your Supabase credentials:
- **URL**: `https://duvyhxrxexcztuqxkvzd.supabase.co`
- **Service Role Key**: Already configured in `src/lib/supabase.ts`

### 2. Database Setup
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to your project: `duvyhxrxexcztuqxkvzd`
3. Go to **SQL Editor**
4. Copy and paste the contents of `database-setup.sql`
5. Run the script to create all necessary tables and policies

### 3. Demo Login Credentials
For quick demonstration, use these demo accounts:

#### Student Account
- **Email**: `student@demo.com`
- **Password**: `demo123456`
- **Role**: Student

#### Teacher Account
- **Email**: `teacher@demo.com`
- **Password**: `demo123456`
- **Role**: Teacher

### 4. Running the Application
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 5. Demo Features

#### Student Dashboard
- Upload assignments (PDF, DOC, DOCX)
- View AI analysis results
- Track academic progress
- See recommended resources
- Monitor submission status

#### Teacher Dashboard
- Review student submissions
- Approve/reject AI assessments
- View class-wide analytics
- Monitor weak topics across students
- Provide feedback

### 6. Google API Integration
The Google API key is configured for potential future integrations:
- **API Key**: `AIzaSyCPUcCMklEut1B4PSSVgO9g1YdOSptAS0E`

### 7. Authentication Flow
1. Users can sign up with email/password
2. Google OAuth is available
3. Demo login buttons for instant access
4. Role-based routing (Student/Teacher)
5. Protected routes ensure proper access

### 8. Database Schema

#### user_profiles Table
- `id` (UUID, Primary Key)
- `email` (TEXT)
- `role` (TEXT: 'student' | 'teacher')
- `full_name` (TEXT)
- `avatar_url` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### submissions Table
- `id` (UUID, Primary Key)
- `student_id` (UUID, Foreign Key)
- `file_name` (TEXT)
- `file_url` (TEXT)
- `status` (TEXT: 'pending' | 'analyzed' | 'approved' | 'rejected')
- `ai_score` (INTEGER)
- `teacher_approved` (BOOLEAN)
- `teacher_feedback` (TEXT)
- `weak_topics` (TEXT[])
- `recommended_resources` (JSONB)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 9. Security Features
- Row Level Security (RLS) enabled
- Role-based access control
- Protected routes
- Secure authentication

### 10. Demo Data
The application includes mock data for demonstration purposes. In a production environment, this would be replaced with real data from the Supabase database.

## 🎯 Hackathon Demo Tips

1. **Quick Demo**: Use the demo login buttons for instant access
2. **Student Flow**: Upload a file → See AI analysis → Wait for teacher approval
3. **Teacher Flow**: Review submissions → Approve/reject → View analytics
4. **Real-time**: Changes are reflected immediately in the UI
5. **Mobile Responsive**: Works on all device sizes

## 🔧 Troubleshooting

### Common Issues
1. **Database Connection**: Ensure Supabase project is active
2. **RLS Policies**: Check if policies are properly set up
3. **Authentication**: Verify service role key is correct
4. **CORS**: Supabase handles CORS automatically

### Support
For hackathon support, check the console for any error messages and ensure all database tables are created properly.
