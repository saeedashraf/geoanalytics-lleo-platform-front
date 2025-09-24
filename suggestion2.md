# Supabase Authentication Integration Suggestion

## Overview
This document outlines how to integrate Supabase authentication into your LLEO frontend to provide persistent user sessions and analysis history. This will replace the current localStorage-based user ID system with proper authentication.

## Current State vs. Proposed State

### Current Implementation
- User ID generated and stored in localStorage
- No real authentication system
- Anonymous user sessions
- Limited user data persistence

### Proposed Implementation
- Supabase Auth for user management
- Email-based user identification
- Persistent user sessions across devices
- Full user analysis history tracking

## Implementation Plan

### 1. Supabase Setup

#### Install Dependencies
```bash
npm install @supabase/supabase-js @supabase/auth-ui-react @supabase/auth-ui-shared
```

#### Environment Configuration
Create/update `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Supabase Client Setup
Create `src/lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for better TypeScript support
export type User = {
  id: string
  email: string
  created_at: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
  }
}
```

### 2. Database Schema

#### Users Table (Supabase Auth handles this automatically)
- `id` (UUID) - Primary key
- `email` (text) - User email
- `created_at` (timestamp)
- `user_metadata` (jsonb) - Additional user info

#### User Profiles Table (Optional - for additional user data)
```sql
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own profile
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);
```

### 3. Authentication Components

#### Auth Context Provider
Create `src/contexts/AuthContext.tsx`:
```typescript
'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, User } from '@/lib/supabase'
import { Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string) => Promise<any>
  signOut: () => Promise<any>
  resetPassword: (email: string) => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user as User || null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user as User || null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password })
  }

  const signUp = async (email: string, password: string) => {
    return await supabase.auth.signUp({ email, password })
  }

  const signOut = async () => {
    return await supabase.auth.signOut()
  }

  const resetPassword = async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email)
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

#### Auth Modal Component
Create `src/components/auth/AuthModal.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Mail, Lock, User, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'signin' | 'signup'
}

export default function AuthModal({ isOpen, onClose, initialMode = 'signin' }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const { signIn, signUp, resetPassword } = useAuth()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) throw error
        onClose()
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password)
        if (error) throw error
        setMessage('Check your email for the confirmation link!')
      } else if (mode === 'reset') {
        const { error } = await resetPassword(email)
        if (error) throw error
        setMessage('Password reset email sent!')
      }
    } catch (error: any) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-amber-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <User className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              {mode === 'signin' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
            </h2>
            <p className="text-slate-600 mt-2">
              {mode === 'signin' ? 'Sign in to access your analyses' :
               mode === 'signup' ? 'Join the LLEO community' :
               'Enter your email to reset your password'}
            </p>
          </div>

          {message && (
            <div className="mb-4 p-3 rounded-lg bg-blue-50 text-blue-800 text-sm">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full !bg-gradient-to-r !from-green-500 !to-green-500"
            >
              {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Email'}
            </Button>
          </form>

          <div className="mt-6 space-y-2 text-center text-sm">
            {mode === 'signin' ? (
              <>
                <button
                  onClick={() => setMode('reset')}
                  className="text-green-600 hover:text-green-700"
                >
                  Forgot your password?
                </button>
                <div>
                  Don't have an account?{' '}
                  <button
                    onClick={() => setMode('signup')}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    Sign up
                  </button>
                </div>
              </>
            ) : mode === 'signup' ? (
              <div>
                Already have an account?{' '}
                <button
                  onClick={() => setMode('signin')}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Sign in
                </button>
              </div>
            ) : (
              <button
                onClick={() => setMode('signin')}
                className="text-green-600 hover:text-green-700"
              >
                Back to sign in
              </button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
```

### 4. Update Header Component

Modify `src/components/layout/Header.tsx`:
```typescript
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'
import AuthModal from '@/components/auth/AuthModal'

// Add to Header component
const { user, signOut, loading } = useAuth()
const [showAuthModal, setShowAuthModal] = useState(false)

// Replace the current profile dropdown with:
{user ? (
  // Authenticated user menu
  <div className="relative">
    <button
      onClick={() => setIsProfileOpen(!isProfileOpen)}
      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-green-700 transition-colors"
    >
      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
        <User className="w-4 h-4 text-white" />
      </div>
      <span className="text-green-200 text-sm hidden sm:block">
        {user.email?.split('@')[0]}
      </span>
      <ChevronDown className={`w-4 h-4 text-green-200 transition-transform duration-200 ${
        isProfileOpen ? 'rotate-180' : ''
      }`} />
    </button>
    {/* Profile dropdown menu stays the same but add signOut functionality */}
  </div>
) : (
  // Unauthenticated user - show sign in button
  <Button
    variant="ghost"
    size="sm"
    onClick={() => setShowAuthModal(true)}
    className="text-green-200 hover:text-white"
  >
    Sign In
  </Button>
)}

{/* Add AuthModal */}
<AuthModal
  isOpen={showAuthModal}
  onClose={() => setShowAuthModal(false)}
/>
```

### 5. Update API Utils

Modify `src/utils/api.ts`:
```typescript
import { supabase } from '@/lib/supabase'

// Replace getUserId function
export const getUserInfo = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user ? {
    id: user.id,
    email: user.email
  } : null
}

// Update API calls to include user info
export const submitAnalysis = async (
  prompt: string,
  credentialsFile?: File
) => {
  const userInfo = await getUserInfo()
  if (!userInfo) {
    throw new Error('User must be authenticated')
  }

  const formData = new FormData()
  formData.append('prompt', prompt)
  formData.append('user_id', userInfo.id)
  formData.append('user_email', userInfo.email || '')

  if (credentialsFile) {
    formData.append('credentials', credentialsFile)
  }

  // Rest of the function remains the same
}

// Update getUserGallery to use authenticated user ID
export const getUserGallery = async (): Promise<GalleryItem[]> => {
  const userInfo = await getUserInfo()
  if (!userInfo) {
    return []
  }

  const response = await fetch(`${API_BASE_URL}/gallery/${userInfo.id}`)

  if (!response.ok) {
    throw new Error('Failed to fetch user gallery')
  }

  return response.json()
}
```

### 6. Update Main App Component

Wrap your app with AuthProvider in `src/app/layout.tsx`:
```typescript
import { AuthProvider } from '@/contexts/AuthContext'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

### 7. Protected Routes and Auth Guards

Create `src/components/auth/AuthGuard.tsx`:
```typescript
'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'
import AuthModal from './AuthModal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return fallback || (
      <>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Authentication Required
            </h2>
            <p className="text-slate-600 mb-6">
              Please sign in to access your analyses
            </p>
            <Button
              onClick={() => setShowAuthModal(true)}
              className="!bg-gradient-to-r !from-green-500 !to-green-500"
            >
              Sign In
            </Button>
          </div>
        </div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </>
    )
  }

  return <>{children}</>
}
```

### 8. Backend API Updates

Your backend should be updated to handle authenticated requests:

```python
# Example backend changes (if using FastAPI)
from supabase import create_client, Client

# Add to your backend endpoints
@app.post("/analyze")
async def submit_analysis(
    prompt: str,
    user_id: str,
    user_email: str,
    credentials: Optional[UploadFile] = None
):
    # Store analysis with user_id and user_email
    session_data = {
        'user_id': user_id,
        'user_email': user_email,
        'prompt': prompt,
        'session_id': str(uuid.uuid4()),
        'created_at': datetime.utcnow().isoformat()
    }

    # Your analysis logic here
    return session_data

@app.get("/gallery/{user_id}")
async def get_user_gallery(user_id: str):
    # Return only analyses belonging to this user
    analyses = get_analyses_by_user_id(user_id)
    return analyses
```

## Benefits of This Implementation

1. **Persistent Sessions**: Users stay logged in across browser sessions
2. **Cross-Device Access**: Access analyses from any device
3. **Secure Authentication**: Supabase handles security best practices
4. **User Management**: Built-in user registration, password reset, etc.
5. **Scalable**: Easy to add features like user profiles, subscriptions
6. **Analytics**: Track user behavior and usage patterns

## Migration Strategy

1. **Phase 1**: Implement authentication alongside existing localStorage system
2. **Phase 2**: Migrate existing localStorage data to authenticated users
3. **Phase 3**: Remove localStorage fallback and require authentication

## Additional Features to Consider

1. **Social Authentication**: Google, GitHub, etc.
2. **User Profiles**: Additional user metadata and preferences
3. **Subscription Management**: Integration with payment providers
4. **Team/Organization Support**: Shared analyses and collaboration
5. **API Keys**: For programmatic access
6. **Admin Dashboard**: User management and analytics

This implementation will provide a robust, scalable authentication system that enhances user experience while maintaining security best practices.