# Phase 1: User Authentication and Profiles

## Overview

Phase 1 adds user authentication via GitHub OAuth, personal profiles, skill management, training progress tracking, and vacancy bookmarks.

## Features

### 1. Authentication
- **GitHub OAuth** - Login with GitHub account
- **JWT tokens** - Secure session management
- **Auto-registration** - New users created automatically on first login

### 2. User Profiles
- **Public profiles** - `/profile/@username` for each user
- **Privacy controls** - Make profile public/private
- **Profile fields**:
  - Display name, bio, location, website
  - Avatar from GitHub
  - Join date, last login
  - Skills with proficiency levels (1-5)

### 3. Skills Management
- **Add skills** - Select from existing skills database
- **Proficiency levels** - Rate yourself 1-5 on each skill
- **Update/Remove** - Manage your skill list
- **Skills by category** - Organized view

### 4. Training Progress
- **Track completion** - Save progress on each training module
- **Quiz answers** - Store user responses
- **Code solutions** - Save submitted code
- **Time tracking** - Record time spent on each module
- **Scoring** - Track quiz/exercise scores

### 5. Vacancy Bookmarks
- **Save vacancies** - Bookmark interesting job postings
- **Quick access** - View all bookmarked vacancies
- **Remove bookmarks** - Manage saved items

### 6. User Statistics
- Total skills count
- Completed trainings
- Total time spent (hours)
- Average score
- Bookmarked vacancies count
- Skills breakdown by category
- Recent activity timeline

## API Endpoints

### Authentication (`/api/v1/auth`)

```
GET  /github/authorize     - Get GitHub OAuth URL
POST /github/callback      - Handle OAuth callback, create/login user
GET  /me                   - Get current user profile
POST /logout               - Logout (client-side token removal)
```

### Users (`/api/v1/users`)

```
# Profile
GET    /{username}         - Get public user profile
PATCH  /me                 - Update own profile

# Skills
GET    /me/skills          - Get user skills
POST   /me/skills          - Add skill to profile
PATCH  /me/skills/{id}     - Update skill proficiency
DELETE /me/skills/{id}     - Remove skill

# Training Progress
GET    /me/progress        - Get training progress (filter by skill, completed)
POST   /me/progress        - Create/update progress for a module

# Bookmarks
GET    /me/bookmarks       - Get bookmarked vacancies (paginated)
POST   /me/bookmarks       - Bookmark a vacancy
DELETE /me/bookmarks/{id}  - Remove bookmark

# Stats
GET    /me/stats           - Get user statistics
```

## Database Schema

### `users` table
- `id` - Primary key
- `github_id` - GitHub user ID (unique, indexed)
- `username` - Username (unique, indexed)
- `email` - Email (nullable, indexed)
- `avatar_url` - Profile picture URL
- `display_name` - Full name
- `bio` - User bio
- `location` - Location
- `website` - Personal website URL
- `is_active` - Account active flag
- `is_public` - Profile visibility
- `show_email` - Show email on profile
- `is_verified` - Email verified flag
- `created_at` - Registration date
- `updated_at` - Last profile update
- `last_login` - Last login timestamp

### `user_skills` table (many-to-many)
- `user_id` - FK to users
- `skill_id` - FK to skills
- `proficiency_level` - 1-5 rating
- `created_at` - When skill was added

### `training_progress` table
- `id` - Primary key
- `user_id` - FK to users
- `skill` - Skill name
- `module_index` - Module number (0-based)
- `completed` - Completion flag
- `score` - Quiz/exercise score (0-100)
- `time_spent_seconds` - Time spent
- `quiz_answers` - JSON of quiz responses
- `code_solution` - Submitted code
- `started_at` - When module was started
- `completed_at` - When module was completed
- `updated_at` - Last update

### `user_bookmarks` table (many-to-many)
- `user_id` - FK to users
- `vacancy_id` - FK to vacancies
- `created_at` - When bookmarked

## Configuration

Add to `.env`:

```bash
# JWT
SECRET_KEY=your-secret-key-generate-strong-random-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200  # 30 days

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_oauth_app_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_app_client_secret
GITHUB_REDIRECT_URI=https://ai-skills.syntog.ru/auth/callback
```

### Setting up GitHub OAuth App

1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: AI Skills Dashboard
   - **Homepage URL**: `https://ai-skills.syntog.ru`
   - **Authorization callback URL**: `https://ai-skills.syntog.ru/auth/callback`
4. Copy Client ID and Client Secret to `.env`

## Frontend Integration

### 1. Auth Context

```tsx
// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  email?: string;
  display_name?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Load from localStorage on mount
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('auth_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

### 2. API Client with Auth

```tsx
// src/lib/api.ts
const API_BASE = 'https://ai-skills.syntog.ru/api/v1';

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('auth_token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      // Token expired, logout
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/';
    }
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
}
```

### 3. OAuth Callback Page

```tsx
// src/pages/AuthCallback.tsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const code = searchParams.get('code');
    
    if (!code) {
      navigate('/');
      return;
    }

    // Exchange code for token
    fetch('https://ai-skills.syntog.ru/api/v1/auth/github/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
      .then(res => res.json())
      .then(data => {
        login(data.access_token, data.user);
        navigate('/dashboard');
      })
      .catch(err => {
        console.error('Auth failed:', err);
        navigate('/');
      });
  }, [searchParams, navigate, login]);

  return <div>Authenticating...</div>;
}
```

### 4. Login Button

```tsx
// In Header.tsx
import { useAuth } from '../context/AuthContext';

function Header() {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogin = async () => {
    const response = await fetch(
      'https://ai-skills.syntog.ru/api/v1/auth/github/authorize'
    );
    const data = await response.json();
    window.location.href = data.authorization_url;
  };

  return (
    <header>
      {isAuthenticated ? (
        <div>
          <img src={user?.avatar_url} alt={user?.username} />
          <span>{user?.username}</span>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login with GitHub</button>
      )}
    </header>
  );
}
```

## Security Considerations

1. **JWT Secret** - Use strong random string (32+ characters)
2. **Token Expiration** - Tokens expire after 30 days
3. **HTTPS Only** - Always use HTTPS in production
4. **CORS** - Configure allowed origins
5. **Rate Limiting** - Add rate limiting to auth endpoints
6. **OAuth State** - Implement proper CSRF protection with state parameter
7. **Token Storage** - Store tokens in localStorage (or httpOnly cookies for better security)

## Testing

```bash
# Test auth flow
curl -X GET https://ai-skills.syntog.ru/api/v1/auth/github/authorize

# Test authenticated endpoint (after login)
curl -X GET https://ai-skills.syntog.ru/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test skills management
curl -X POST https://ai-skills.syntog.ru/api/v1/users/me/skills \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"skill_id": 1, "proficiency_level": 3}'

# Test progress tracking
curl -X POST https://ai-skills.syntog.ru/api/v1/users/me/progress \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"skill": "Python", "module_index": 0, "completed": true, "score": 85}'
```

## Next Steps (Phase 2)

- AI code review for training exercises
- Real code execution sandbox (Judge0 API)
- Social features (follow users, share progress)
- Leaderboards and achievements
- Project showcase
- Skill recommendations based on gap analysis
