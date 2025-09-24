# Complete Supabase Authentication Integration Guide for LLEO

## Overview
This comprehensive guide outlines the complete integration of Supabase authentication into your LLEO (Large Language Models for Earth Observation) platform. This will transform your current localStorage-based system into a professional, secure authentication system with persistent user sessions, cross-device access, and proper user management.

## Table of Contents
1. [Current vs. Proposed Architecture](#current-vs-proposed-architecture)
2. [Supabase Project Setup](#supabase-project-setup)
3. [Database Schema Design](#database-schema-design)
4. [Frontend Implementation](#frontend-implementation)
5. [Backend Integration](#backend-integration)
6. [Security Considerations](#security-considerations)
7. [Deployment Strategy](#deployment-strategy)
8. [Migration Plan](#migration-plan)
9. [Advanced Features](#advanced-features)

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

Your FastAPI backend requires comprehensive updates to support Supabase authentication:

#### Install Backend Dependencies

```bash
pip install supabase python-jose[cryptography] passlib[bcrypt]
```

#### Backend Environment Configuration

```env
# Add to your .env file
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key  # For admin operations
SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret  # From Supabase project settings
```

#### Supabase Client Setup for Backend

Create `backend/utils/supabase_client.py`:
```python
import os
from supabase import create_client, Client
from typing import Optional

# Supabase client for backend operations
supabase_url: str = os.getenv("SUPABASE_URL")
supabase_service_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY")  # Admin access
supabase_anon_key: str = os.getenv("SUPABASE_ANON_KEY")

# Admin client for server-side operations
supabase_admin: Client = create_client(supabase_url, supabase_service_key)

# Regular client for user operations
supabase_client: Client = create_client(supabase_url, supabase_anon_key)
```

#### Authentication Middleware

Create `backend/middleware/auth.py`:
```python
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
import os
from typing import Optional
from utils.supabase_client import supabase_client

security = HTTPBearer()
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"

class User:
    def __init__(self, id: str, email: str, user_metadata: dict = None):
        self.id = id
        self.email = email
        self.user_metadata = user_metadata or {}

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """
    Verify JWT token and return current user
    """
    try:
        # Verify the token with Supabase
        response = supabase_client.auth.get_user(credentials.credentials)

        if response.user:
            return User(
                id=response.user.id,
                email=response.user.email,
                user_metadata=response.user.user_metadata
            )
        else:
            raise HTTPException(status_code=401, detail="Invalid authentication token")

    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Could not validate credentials: {str(e)}")

async def get_optional_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))) -> Optional[User]:
    """
    Optional authentication - returns User if authenticated, None otherwise
    """
    if not credentials:
        return None

    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None
```

#### Database Models with Supabase Integration

Create `backend/models/analysis.py`:
```python
from datetime import datetime
from typing import Optional, List, Dict, Any
from utils.supabase_client import supabase_admin
import uuid

class AnalysisModel:
    @staticmethod
    async def create_analysis(
        user_id: str,
        user_email: str,
        query: str,
        session_id: str,
        analysis_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Create new analysis record in Supabase"""
        analysis_record = {
            "session_id": session_id,
            "user_id": user_id,
            "user_email": user_email,
            "query": query,
            "analysis_data": analysis_data,
            "created_at": datetime.utcnow().isoformat(),
            "status": "completed",
            "is_public": False  # Private by default
        }

        result = supabase_admin.table("analyses").insert(analysis_record).execute()
        return result.data[0] if result.data else None

    @staticmethod
    async def get_user_analyses(user_id: str, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        """Get analyses for a specific user"""
        result = supabase_admin.table("analyses") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .limit(limit) \
            .offset(offset) \
            .execute()

        return result.data or []

    @staticmethod
    async def get_public_analyses(limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        """Get public analyses for community gallery"""
        result = supabase_admin.table("analyses") \
            .select("*") \
            .eq("is_public", True) \
            .order("created_at", desc=True) \
            .limit(limit) \
            .offset(offset) \
            .execute()

        return result.data or []

    @staticmethod
    async def get_analysis_by_session_id(session_id: str, user_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Get specific analysis by session ID"""
        query = supabase_admin.table("analyses").select("*").eq("session_id", session_id)

        # If user_id provided, ensure they own the analysis or it's public
        if user_id:
            query = query.or_(f"user_id.eq.{user_id},is_public.eq.true")
        else:
            query = query.eq("is_public", True)

        result = query.execute()
        return result.data[0] if result.data else None

    @staticmethod
    async def update_analysis_visibility(session_id: str, user_id: str, is_public: bool) -> bool:
        """Update analysis visibility (public/private)"""
        result = supabase_admin.table("analyses") \
            .update({"is_public": is_public}) \
            .eq("session_id", session_id) \
            .eq("user_id", user_id) \
            .execute()

        return len(result.data) > 0

    @staticmethod
    async def delete_analysis(session_id: str, user_id: str) -> bool:
        """Delete analysis (user must own it)"""
        result = supabase_admin.table("analyses") \
            .delete() \
            .eq("session_id", session_id) \
            .eq("user_id", user_id) \
            .execute()

        return len(result.data) > 0
```

#### Required Database Schema (Supabase SQL)

Execute this SQL in your Supabase SQL editor:

```sql
-- Create analyses table
CREATE TABLE analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    query TEXT NOT NULL,
    analysis_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'processing',
    is_public BOOLEAN DEFAULT false,
    location_name TEXT,
    analysis_type TEXT,
    thumbnail_url TEXT,
    download_url TEXT
);

-- Enable RLS
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Policies for analyses table
-- Users can view their own analyses
CREATE POLICY "Users can view own analyses" ON analyses
    FOR SELECT USING (auth.uid() = user_id);

-- Users can view public analyses
CREATE POLICY "Anyone can view public analyses" ON analyses
    FOR SELECT USING (is_public = true);

-- Users can insert their own analyses
CREATE POLICY "Users can create analyses" ON analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own analyses
CREATE POLICY "Users can update own analyses" ON analyses
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own analyses
CREATE POLICY "Users can delete own analyses" ON analyses
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_analyses_user_id ON analyses(user_id);
CREATE INDEX idx_analyses_session_id ON analyses(session_id);
CREATE INDEX idx_analyses_is_public ON analyses(is_public);
CREATE INDEX idx_analyses_created_at ON analyses(created_at DESC);

-- User preferences/settings table (optional)
CREATE TABLE user_settings (
    user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
    preferences JSONB DEFAULT '{}',
    subscription_tier TEXT DEFAULT 'free',
    api_usage_count INTEGER DEFAULT 0,
    monthly_usage_limit INTEGER DEFAULT 10,
    usage_reset_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Users can only access their own settings
CREATE POLICY "Users can manage own settings" ON user_settings
    FOR ALL USING (auth.uid() = user_id);

-- Function to automatically create user settings on first analysis
CREATE OR REPLACE FUNCTION create_user_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_settings (user_id)
    VALUES (NEW.user_id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create settings when user creates first analysis
CREATE TRIGGER create_user_settings_trigger
    AFTER INSERT ON analyses
    FOR EACH ROW
    EXECUTE FUNCTION create_user_settings();
```

#### Updated API Endpoints

Update your main FastAPI application:

```python
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from middleware.auth import get_current_user, get_optional_user, User
from models.analysis import AnalysisModel
import uuid
from datetime import datetime
from typing import Optional

app = FastAPI(title="LLEO Analysis API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-frontend-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze")
async def submit_analysis(
    query: str = Form(...),
    credentials_file: UploadFile = File(...),
    user: User = Depends(get_current_user)
):
    """Submit analysis request - requires authentication"""
    try:
        # Generate unique session ID
        session_id = str(uuid.uuid4())

        # Your existing analysis logic here
        # ... process credentials_file, run analysis, etc.

        # Example analysis result
        analysis_result = {
            "session_id": session_id,
            "query": query,
            "user_id": user.id,
            "user_email": user.email,
            "status": "completed",
            "results": {
                "thumbnail_url": f"/results/{session_id}/preview",
                "download_url": f"/results/{session_id}/download",
                "map_url": f"/results/{session_id}/map",
                "chart_url": f"/results/{session_id}/chart"
            }
        }

        # Save to database
        saved_analysis = await AnalysisModel.create_analysis(
            user_id=user.id,
            user_email=user.email,
            query=query,
            session_id=session_id,
            analysis_data=analysis_result
        )

        return analysis_result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/gallery/{user_id}")
async def get_user_gallery(
    user_id: str,
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user)
):
    """Get user's analysis gallery - must be authenticated and accessing own gallery"""
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    analyses = await AnalysisModel.get_user_analyses(user_id, limit, offset)
    return analyses

@app.get("/gallery/community")
async def get_community_gallery(
    limit: int = 50,
    offset: int = 0,
    user: Optional[User] = Depends(get_optional_user)
):
    """Get public community analyses - authentication optional"""
    analyses = await AnalysisModel.get_public_analyses(limit, offset)
    return analyses

@app.get("/results/{session_id}/metadata")
async def get_analysis_metadata(
    session_id: str,
    user: Optional[User] = Depends(get_optional_user)
):
    """Get analysis metadata"""
    user_id = user.id if user else None
    analysis = await AnalysisModel.get_analysis_by_session_id(session_id, user_id)

    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    return analysis

@app.put("/results/{session_id}/visibility")
async def update_analysis_visibility(
    session_id: str,
    is_public: bool,
    user: User = Depends(get_current_user)
):
    """Make analysis public or private"""
    success = await AnalysisModel.update_analysis_visibility(session_id, user.id, is_public)

    if not success:
        raise HTTPException(status_code=404, detail="Analysis not found or access denied")

    return {"status": "success", "is_public": is_public}

@app.delete("/results/{session_id}")
async def delete_analysis(
    session_id: str,
    user: User = Depends(get_current_user)
):
    """Delete analysis - user must own it"""
    success = await AnalysisModel.delete_analysis(session_id, user.id)

    if not success:
        raise HTTPException(status_code=404, detail="Analysis not found or access denied")

    return {"status": "deleted"}

@app.get("/user/profile")
async def get_user_profile(user: User = Depends(get_current_user)):
    """Get current user's profile"""
    return {
        "id": user.id,
        "email": user.email,
        "metadata": user.user_metadata
    }

@app.get("/user/usage")
async def get_user_usage(user: User = Depends(get_current_user)):
    """Get user's API usage statistics"""
    # Query user_settings table for usage info
    result = supabase_admin.table("user_settings") \
        .select("*") \
        .eq("user_id", user.id) \
        .execute()

    if result.data:
        settings = result.data[0]
        return {
            "api_usage_count": settings.get("api_usage_count", 0),
            "monthly_limit": settings.get("monthly_usage_limit", 10),
            "subscription_tier": settings.get("subscription_tier", "free"),
            "usage_reset_date": settings.get("usage_reset_date")
        }

    return {
        "api_usage_count": 0,
        "monthly_limit": 10,
        "subscription_tier": "free"
    }
```

## Benefits of This Implementation

1. **Persistent Sessions**: Users stay logged in across browser sessions
2. **Cross-Device Access**: Access analyses from any device
3. **Secure Authentication**: Supabase handles security best practices
4. **User Management**: Built-in user registration, password reset, etc.
5. **Scalable**: Easy to add features like user profiles, subscriptions
6. **Analytics**: Track user behavior and usage patterns
7. **Row Level Security**: Database-level security ensures data isolation
8. **Real-time Features**: Supabase supports real-time subscriptions for live updates

## Deployment Strategy

### Frontend Deployment (Vercel/Netlify)

1. **Environment Variables**: Add Supabase credentials to your deployment platform
2. **Domain Configuration**: Update CORS origins in both Supabase and FastAPI
3. **Build Process**: Ensure all environment variables are available at build time

### Backend Deployment (GCP Cloud Run)

1. **Environment Variables**: Add Supabase credentials to Cloud Run configuration
2. **Database Connection**: Ensure Cloud Run can access Supabase (should be automatic)
3. **Service Account**: May need additional permissions for Supabase integration

### Supabase Configuration

1. **Authentication Settings**: Configure email templates, OAuth providers if needed
2. **URL Configuration**: Add your frontend and backend URLs to allowed origins
3. **RLS Policies**: Test policies thoroughly before production deployment
4. **Backup Strategy**: Set up regular database backups

## Migration Plan

### Phase 1: Parallel Implementation (1-2 weeks)
- Implement Supabase authentication alongside existing localStorage system
- Add authentication components but keep them optional
- Test authentication flow thoroughly
- Create database schema and API endpoints

### Phase 2: User Data Migration (1 week)
- Create migration scripts to move localStorage data to authenticated users
- Provide users with account creation prompts
- Allow users to "claim" their existing analyses by creating accounts
- Maintain backward compatibility during transition

### Phase 3: Full Authentication (1 week)
- Make authentication required for new analyses
- Gradually deprecate localStorage system
- Provide clear migration path for remaining users
- Remove localStorage fallback code

### Migration Code Example

Create `frontend/utils/migration.ts`:
```typescript
import { supabase } from '@/lib/supabase'
import { getUserId, clearUserData } from './api'

export async function migrateLocalStorageData() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Get localStorage data
  const oldUserId = getUserId()
  const localAnalyses = localStorage.getItem(`analyses_${oldUserId}`)

  if (localAnalyses) {
    try {
      const analyses = JSON.parse(localAnalyses)

      // Migrate each analysis to the authenticated user
      for (const analysis of analyses) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/migrate-analysis`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            old_user_id: oldUserId,
            analysis_data: analysis,
            new_user_id: user.id
          })
        })
      }

      // Clear old data after successful migration
      clearUserData()

    } catch (error) {
      console.error('Migration failed:', error)
    }
  }
}
```

## Advanced Features

### 1. Social Authentication

Add OAuth providers to Supabase dashboard and update AuthModal:

```typescript
// Add to AuthModal component
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'

<Auth
  supabaseClient={supabase}
  appearance={{ theme: ThemeSupa }}
  providers={['google', 'github']}
  redirectTo={window.location.origin}
/>
```

### 2. Subscription Management

Integrate with Stripe for payments:

```typescript
// Add to database schema
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT,
  price_id TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Team Collaboration

Add organization support:

```sql
-- Organizations table
CREATE TABLE organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization members
CREATE TABLE organization_members (
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES auth.users(id),
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (organization_id, user_id)
);
```

### 4. API Keys for Programmatic Access

```sql
-- API keys table
CREATE TABLE api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);
```

### 5. Admin Dashboard

Create admin-only routes and components:

```typescript
// Check if user is admin
const isAdmin = user?.user_metadata?.role === 'admin'

// Admin-only API endpoints
@app.get("/admin/users")
async def get_all_users(user: User = Depends(get_admin_user)):
    # Return user statistics and management
```

### 6. Real-time Features

Add real-time analysis updates:

```typescript
// Subscribe to analysis updates
useEffect(() => {
  if (!user) return

  const channel = supabase
    .channel('analyses')
    .on('postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'analyses',
        filter: `user_id=eq.${user.id}`
      },
      (payload) => {
        // Update UI when analysis status changes
        console.log('Analysis updated:', payload)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [user])
```

## Security Considerations

### 1. Environment Variables Security
- Never expose service role keys in frontend
- Use different keys for development and production
- Rotate keys regularly

### 2. Row Level Security Best Practices
- Test all RLS policies thoroughly
- Use principle of least privilege
- Audit access patterns regularly

### 3. API Security
- Implement rate limiting
- Validate all inputs
- Use HTTPS everywhere
- Monitor for suspicious activity

### 4. Data Protection
- Encrypt sensitive data at rest
- Implement proper data retention policies
- Provide user data export/deletion tools
- Comply with GDPR/CCPA requirements

## Monitoring and Analytics

### 1. User Analytics
```typescript
// Track user actions
const trackEvent = (event: string, properties: any) => {
  if (user) {
    supabase.from('user_events').insert({
      user_id: user.id,
      event_name: event,
      properties,
      timestamp: new Date().toISOString()
    })
  }
}
```

### 2. Performance Monitoring
- Monitor authentication latency
- Track API response times
- Set up alerts for failed authentications
- Monitor database query performance

### 3. Error Tracking
```typescript
// Enhanced error handling with user context
const handleError = (error: Error) => {
  console.error('Application error:', error)

  // Send to error tracking service with user context
  errorTrackingService.captureException(error, {
    user: user ? { id: user.id, email: user.email } : null,
    tags: { component: 'authentication' }
  })
}
```

## Testing Strategy

### 1. Authentication Flow Tests
```typescript
describe('Authentication', () => {
  it('should sign up new users', async () => {
    const { error } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpassword'
    })
    expect(error).toBeNull()
  })

  it('should protect authenticated routes', async () => {
    // Test that unauthenticated users can't access protected content
  })
})
```

### 2. Database Policy Tests
```sql
-- Test RLS policies
SELECT * FROM analyses WHERE user_id != auth.uid(); -- Should return no rows
```

### 3. Integration Tests
- Test complete user journey from signup to analysis creation
- Test migration from localStorage to authenticated system
- Test error handling and edge cases

## Conclusion

This comprehensive Supabase integration will transform your LLEO platform into a professional, scalable application with proper user management, security, and data persistence. The phased migration approach ensures minimal disruption to existing users while providing a clear path to a more robust system.

Key benefits include:
- **Professional Authentication**: Industry-standard security practices
- **Scalable Architecture**: Ready for growth and additional features
- **Better User Experience**: Persistent sessions and cross-device access
- **Data Security**: Database-level security with Row Level Security
- **Future-Ready**: Foundation for subscriptions, teams, and advanced features

The implementation provides immediate value while establishing a foundation for future enhancements like team collaboration, API access, and advanced analytics.