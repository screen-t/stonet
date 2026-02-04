# TASK: FE-004 - Profile Page Components

**Assigned To:** Frontend Lead  
**Priority:** HIGH  
**Estimate:** 16 hours  
**Deadline:** February 9, 2026  
**Status:** Not Started  
**Dependencies:** FE-001 (Development Environment Setup), BE-006 (User Profile CRUD)  
**Created:** February 5, 2026

---

## Objective

Build comprehensive profile page components including profile display, edit functionality, avatar upload, and cover image management with responsive design and proper state management.

## Prerequisites

- FE-001 (Development Environment Setup) completed
- BE-006 (User Profile CRUD) completed or in progress
- Understanding of file uploads and image handling
- Familiarity with form state management
- Knowledge of responsive design patterns

## Instructions

### Step 1: Profile Types and Interfaces (types/profile.ts)

```typescript
export interface UserProfile {
  id: string
  username: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  bio?: string
  location?: string
  website?: string
  linkedin_url?: string
  twitter_handle?: string
  avatar_url?: string
  cover_image_url?: string
  is_verified: boolean
  is_public: boolean
  created_at: string
  updated_at: string
  last_active_at?: string
  work_experience?: WorkExperience[]
  education?: Education[]
}

export interface WorkExperience {
  id?: number
  company_name: string
  position_title: string
  description?: string
  start_date: string
  end_date?: string
  is_current: boolean
  location?: string
}

export interface Education {
  id?: number
  institution_name: string
  degree: string
  field_of_study?: string
  level: 'high_school' | 'associate' | 'bachelor' | 'master' | 'doctorate' | 'certificate' | 'other'
  start_date: string
  end_date?: string
  is_current: boolean
  gpa?: number
  description?: string
}

export interface ProfileUpdateData {
  first_name?: string
  last_name?: string
  bio?: string
  location?: string
  website?: string
  linkedin_url?: string
  twitter_handle?: string
  is_public?: boolean
}
```

### Step 2: Profile API Service (lib/api/profile.ts)

```typescript
import { UserProfile, ProfileUpdateData, WorkExperience, Education } from '@/types/profile'

class ProfileAPI {
  private baseUrl = import.meta.env.VITE_API_BASE_URL

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('access_token')
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'API request failed')
    }

    return response.json()
  }

  async getMyProfile(): Promise<UserProfile> {
    return this.request<UserProfile>('/profile/me')
  }

  async getPublicProfile(username: string): Promise<UserProfile> {
    return this.request<UserProfile>(`/profile/${username}`)
  }

  async updateProfile(data: ProfileUpdateData): Promise<UserProfile> {
    return this.request<UserProfile>('/profile/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async checkUsernameAvailability(username: string): Promise<{ username: string; available: boolean }> {
    return this.request<{ username: string; available: boolean }>(`/profile/check-username/${username}`)
  }

  async uploadAvatar(file: File): Promise<{ avatar_url: string }> {
    const formData = new FormData()
    formData.append('avatar', file)

    const token = localStorage.getItem('access_token')
    const response = await fetch(`${this.baseUrl}/profile/avatar`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Avatar upload failed')
    }

    return response.json()
  }

  async uploadCoverImage(file: File): Promise<{ cover_image_url: string }> {
    const formData = new FormData()
    formData.append('cover', file)

    const token = localStorage.getItem('access_token')
    const response = await fetch(`${this.baseUrl}/profile/cover`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Cover image upload failed')
    }

    return response.json()
  }
}

export const profileApi = new ProfileAPI()
```

### Step 3: Profile Hook (hooks/useProfile.ts)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profileApi } from '@/lib/api/profile'
import { UserProfile, ProfileUpdateData } from '@/types/profile'
import { useToast } from './use-toast'

export function useMyProfile() {
  return useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => profileApi.getMyProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function usePublicProfile(username: string) {
  return useQuery({
    queryKey: ['profile', username],
    queryFn: () => profileApi.getPublicProfile(username),
    enabled: !!username,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: ProfileUpdateData) => profileApi.updateProfile(data),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['profile', 'me'], updatedProfile)
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update profile.',
        variant: 'destructive',
      })
    },
  })
}

export function useAvatarUpload() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (file: File) => profileApi.uploadAvatar(file),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] })
      toast({
        title: 'Avatar Updated',
        description: 'Your profile picture has been updated.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload avatar.',
        variant: 'destructive',
      })
    },
  })
}
```

### Step 4: Avatar Component (components/profile/Avatar.tsx)

```typescript
import React, { useState, useRef } from 'react'
import { Camera, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAvatarUpload } from '@/hooks/useProfile'
import { cn } from '@/lib/utils'

interface AvatarProps {
  src?: string
  alt?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  editable?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Profile picture',
  size = 'md',
  editable = false,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const avatarUpload = useAvatarUpload()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }

      avatarUpload.mutate(file)
    }
  }

  const handleEditClick = () => {
    if (editable && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div
      className={cn(
        'relative inline-block',
        sizeClasses[size],
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar Image */}
      <div className="w-full h-full rounded-full overflow-hidden bg-muted flex items-center justify-center">
        {src ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
          />
        ) : (
          <User className={cn(
            'text-muted-foreground',
            size === 'sm' && 'w-4 h-4',
            size === 'md' && 'w-6 h-6',
            size === 'lg' && 'w-8 h-8',
            size === 'xl' && 'w-12 h-12'
          )} />
        )}
      </div>

      {/* Edit Overlay */}
      {editable && (isHovered || avatarUpload.isPending) && (
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
          {avatarUpload.isPending ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="p-1 h-auto text-white hover:bg-transparent"
              onClick={handleEditClick}
            >
              <Camera className="w-3 h-3" />
            </Button>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      {editable && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      )}
    </div>
  )
}
```

### Step 5: Profile Header Component (components/profile/ProfileHeader.tsx)

```typescript
import React, { useState } from 'react'
import { MapPin, Link as LinkIcon, Calendar, Settings, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from './Avatar'
import { UserProfile } from '@/types/profile'
import { format } from 'date-fns'

interface ProfileHeaderProps {
  profile: UserProfile
  isOwnProfile?: boolean
  onEditClick?: () => void
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  isOwnProfile = false,
  onEditClick,
}) => {
  const [coverImageHovered, setCoverImageHovered] = useState(false)

  const handleCoverImageUpload = () => {
    // Handle cover image upload
    console.log('Cover image upload clicked')
  }

  return (
    <div className="relative">
      {/* Cover Image */}
      <div 
        className="h-48 md:h-64 bg-gradient-to-r from-blue-500 to-purple-600 relative overflow-hidden"
        onMouseEnter={() => setCoverImageHovered(true)}
        onMouseLeave={() => setCoverImageHovered(false)}
      >
        {profile.cover_image_url && (
          <img
            src={profile.cover_image_url}
            alt="Cover image"
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Cover Image Edit Overlay */}
        {isOwnProfile && coverImageHovered && (
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCoverImageUpload}
            >
              <Camera className="w-4 h-4 mr-2" />
              Change Cover
            </Button>
          </div>
        )}
      </div>

      {/* Profile Info */}
      <div className="relative px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-5 -mt-12 sm:-mt-16">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <Avatar
              src={profile.avatar_url}
              alt={`${profile.first_name} ${profile.last_name}`}
              size="xl"
              editable={isOwnProfile}
              className="ring-4 ring-background"
            />
          </div>

          {/* Name and Actions */}
          <div className="mt-4 sm:mt-0 sm:flex-1 sm:min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold text-foreground truncate">
                    {profile.first_name} {profile.last_name}
                  </h1>
                  {profile.is_verified && (
                    <Badge variant="secondary">Verified</Badge>
                  )}
                </div>
                <p className="text-muted-foreground">@{profile.username}</p>
              </div>
              
              {isOwnProfile && onEditClick && (
                <div className="mt-3 sm:mt-0">
                  <Button variant="outline" onClick={onEditClick}>
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="mt-4">
                <p className="text-foreground">{profile.bio}</p>
              </div>
            )}

            {/* Profile Details */}
            <div className="mt-4 flex flex-wrap items-center space-x-4 text-sm text-muted-foreground">
              {profile.location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.website && (
                <div className="flex items-center space-x-1">
                  <LinkIcon className="w-4 h-4" />
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Website
                  </a>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Joined {format(new Date(profile.created_at), 'MMMM yyyy')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### Step 6: Edit Profile Modal (components/profile/EditProfileModal.tsx)

```typescript
import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { UserProfile, ProfileUpdateData } from '@/types/profile'
import { useUpdateProfile } from '@/hooks/useProfile'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  profile: UserProfile
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
}) => {
  const [formData, setFormData] = useState<ProfileUpdateData>({
    first_name: profile.first_name,
    last_name: profile.last_name,
    bio: profile.bio || '',
    location: profile.location || '',
    website: profile.website || '',
    linkedin_url: profile.linkedin_url || '',
    twitter_handle: profile.twitter_handle || '',
    is_public: profile.is_public,
  })

  const updateProfile = useUpdateProfile()

  useEffect(() => {
    if (isOpen) {
      setFormData({
        first_name: profile.first_name,
        last_name: profile.last_name,
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
        linkedin_url: profile.linkedin_url || '',
        twitter_handle: profile.twitter_handle || '',
        is_public: profile.is_public,
      })
    }
  }, [isOpen, profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await updateProfile.mutateAsync(formData)
      onClose()
    } catch (error) {
      // Error handled by the mutation
    }
  }

  const handleInputChange = (field: keyof ProfileUpdateData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name || ''}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                placeholder="First name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name || ''}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder="Last name"
                required
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio || ''}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell people about yourself..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {(formData.bio || '').length}/500 characters
            </p>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location || ''}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="City, Country"
            />
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website || ''}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://yourwebsite.com"
            />
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input
                id="linkedin_url"
                value={formData.linkedin_url || ''}
                onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter_handle">Twitter Handle</Label>
              <Input
                id="twitter_handle"
                value={formData.twitter_handle || ''}
                onChange={(e) => handleInputChange('twitter_handle', e.target.value)}
                placeholder="@username"
              />
            </div>
          </div>

          {/* Privacy Setting */}
          <div className="flex items-center space-x-2">
            <Switch
              id="is_public"
              checked={formData.is_public || false}
              onCheckedChange={(checked) => handleInputChange('is_public', checked)}
            />
            <Label htmlFor="is_public" className="text-sm">
              Make profile public
            </Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

### Step 7: Profile Page (pages/Profile.tsx)

```typescript
import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMyProfile, usePublicProfile } from '@/hooks/useProfile'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { EditProfileModal } from '@/components/profile/EditProfileModal'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth'

export const Profile: React.FC = () => {
  const { username } = useParams<{ username?: string }>()
  const { user } = useAuth()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Determine if this is the user's own profile
  const isOwnProfile = !username || (user && user.username === username)

  // Fetch appropriate profile data
  const {
    data: myProfile,
    isLoading: myProfileLoading,
    error: myProfileError,
  } = useMyProfile({ enabled: isOwnProfile })

  const {
    data: publicProfile,
    isLoading: publicProfileLoading,
    error: publicProfileError,
  } = usePublicProfile(username!, { enabled: !isOwnProfile && !!username })

  const profile = isOwnProfile ? myProfile : publicProfile
  const isLoading = isOwnProfile ? myProfileLoading : publicProfileLoading
  const error = isOwnProfile ? myProfileError : publicProfileError

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Profile Not Found</h2>
          <p className="text-muted-foreground">
            {error?.message || 'This profile does not exist or is private.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        onEditClick={() => setIsEditModalOpen(true)}
      />

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - About */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold">About</h3>
              {profile.bio ? (
                <p className="text-muted-foreground">{profile.bio}</p>
              ) : (
                <p className="text-muted-foreground italic">
                  {isOwnProfile ? 'Add a bio to tell people about yourself.' : 'No bio available.'}
                </p>
              )}
            </div>
          </div>

          {/* Right Column - Activity/Experience */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Work Experience Section */}
              <div className="bg-card rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Experience</h3>
                {profile.work_experience && profile.work_experience.length > 0 ? (
                  <div className="space-y-4">
                    {profile.work_experience.map((work, index) => (
                      <div key={index} className="border-l-2 border-muted pl-4">
                        <h4 className="font-medium">{work.position_title}</h4>
                        <p className="text-primary">{work.company_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {work.start_date} - {work.is_current ? 'Present' : (work.end_date || 'Unknown')}
                        </p>
                        {work.description && (
                          <p className="text-sm mt-2">{work.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">
                    {isOwnProfile ? 'Add your work experience to showcase your career.' : 'No work experience listed.'}
                  </p>
                )}
              </div>

              {/* Education Section */}
              <div className="bg-card rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Education</h3>
                {profile.education && profile.education.length > 0 ? (
                  <div className="space-y-4">
                    {profile.education.map((edu, index) => (
                      <div key={index} className="border-l-2 border-muted pl-4">
                        <h4 className="font-medium">{edu.degree}</h4>
                        <p className="text-primary">{edu.institution_name}</p>
                        {edu.field_of_study && (
                          <p className="text-sm text-muted-foreground">{edu.field_of_study}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {edu.start_date} - {edu.is_current ? 'Present' : (edu.end_date || 'Unknown')}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">
                    {isOwnProfile ? 'Add your education to complete your profile.' : 'No education information listed.'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isOwnProfile && profile && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          profile={profile}
        />
      )}
    </div>
  )
}
```

## Deliverables

- [ ] Profile types and interfaces defined
- [ ] Profile API service implemented
- [ ] Profile-related React hooks created
- [ ] Avatar component with edit functionality
- [ ] Profile header component
- [ ] Edit profile modal
- [ ] Complete profile page component
- [ ] Responsive design implementation
- [ ] Image upload functionality
- [ ] Profile privacy controls

## Acceptance Criteria

1. **Profile Display:**
   - User profiles display correctly with all information
   - Public profiles accessible by username
   - Private profiles properly protected
   - Responsive design works on all devices

2. **Profile Editing:**
   - Users can edit their profile information
   - Form validation works correctly
   - Changes save successfully
   - Real-time updates in UI

3. **Image Management:**
   - Avatar upload functionality works
   - Cover image upload functionality works
   - Image validation (type, size) implemented
   - Loading states during uploads

4. **User Experience:**
   - Smooth transitions and animations
   - Clear loading and error states
   - Intuitive edit interface
   - Proper feedback messages

## Questions or Issues?

Contact:
- **Project Manager:** Daniel
- **Frontend Lead:** [TBD]
- **Backend Lead:** [For API integration]

## Next Steps After Completion

1. Test profile functionality thoroughly
2. Integrate with work experience forms (FE-005)
3. Add profile completion tracking
4. Implement profile sharing features
5. Add profile analytics

---

**Status Updates:**
- [ ] Started: _________
- [ ] Types & API Service: _________
- [ ] Avatar Component: _________
- [ ] Profile Header: _________
- [ ] Edit Modal: _________
- [ ] Profile Page: _________
- [ ] Testing Complete: _________
- [ ] Completed: _________