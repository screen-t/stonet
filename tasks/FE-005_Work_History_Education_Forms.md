# TASK: FE-005 - Work History & Education Forms

**Assigned To:** Frontend Developer 1  
**Priority:** MEDIUM  
**Estimate:** 12 hours  
**Deadline:** February 11, 2026  
**Status:** Not Started  
**Dependencies:** FE-004 (Profile Page Components), BE-007 (Work Experience & Education APIs)  
**Created:** February 5, 2026

---

## Objective

Build comprehensive forms and UI components for managing work experience and education records with proper validation, date handling, and CRUD operations.

## Prerequisites

- FE-004 (Profile Page Components) completed
- BE-007 (Work Experience & Education APIs) completed or in progress
- Understanding of form state management
- Knowledge of date input handling
- Familiarity with dynamic form arrays

## Instructions

### Step 1: Types and Interfaces (types/work-education.ts)

```typescript
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
  level: EducationLevel
  start_date: string
  end_date?: string
  is_current: boolean
  gpa?: number
  description?: string
}

export type EducationLevel = 
  | 'high_school'
  | 'associate'
  | 'bachelor'
  | 'master'
  | 'doctorate'
  | 'certificate'
  | 'other'

export interface WorkExperienceFormData extends Omit<WorkExperience, 'id'> {}
export interface EducationFormData extends Omit<Education, 'id'> {}
```

### Step 2: API Service (lib/api/work-education.ts)

```typescript
import { WorkExperience, Education, WorkExperienceFormData, EducationFormData } from '@/types/work-education'

class WorkEducationAPI {
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

  // Work Experience API methods
  async getWorkExperiences(): Promise<WorkExperience[]> {
    return this.request<WorkExperience[]>('/work-experience')
  }

  async createWorkExperience(data: WorkExperienceFormData): Promise<WorkExperience> {
    return this.request<WorkExperience>('/work-experience', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateWorkExperience(id: number, data: Partial<WorkExperienceFormData>): Promise<WorkExperience> {
    return this.request<WorkExperience>(`/work-experience/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteWorkExperience(id: number): Promise<void> {
    await this.request(`/work-experience/${id}`, {
      method: 'DELETE',
    })
  }

  // Education API methods
  async getEducation(): Promise<Education[]> {
    return this.request<Education[]>('/education')
  }

  async createEducation(data: EducationFormData): Promise<Education> {
    return this.request<Education>('/education', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateEducation(id: number, data: Partial<EducationFormData>): Promise<Education> {
    return this.request<Education>(`/education/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteEducation(id: number): Promise<void> {
    await this.request(`/education/${id}`, {
      method: 'DELETE',
    })
  }
}

export const workEducationApi = new WorkEducationAPI()
```

### Step 3: React Hooks (hooks/useWorkEducation.ts)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { workEducationApi } from '@/lib/api/work-education'
import { WorkExperience, Education, WorkExperienceFormData, EducationFormData } from '@/types/work-education'
import { useToast } from './use-toast'

// Work Experience hooks
export function useWorkExperiences() {
  return useQuery({
    queryKey: ['work-experiences'],
    queryFn: () => workEducationApi.getWorkExperiences(),
  })
}

export function useCreateWorkExperience() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: WorkExperienceFormData) => workEducationApi.createWorkExperience(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-experiences'] })
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] })
      toast({
        title: 'Success',
        description: 'Work experience added successfully.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add work experience.',
        variant: 'destructive',
      })
    },
  })
}

export function useUpdateWorkExperience() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<WorkExperienceFormData> }) => 
      workEducationApi.updateWorkExperience(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-experiences'] })
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] })
      toast({
        title: 'Success',
        description: 'Work experience updated successfully.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update work experience.',
        variant: 'destructive',
      })
    },
  })
}

export function useDeleteWorkExperience() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: number) => workEducationApi.deleteWorkExperience(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-experiences'] })
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] })
      toast({
        title: 'Success',
        description: 'Work experience deleted successfully.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete work experience.',
        variant: 'destructive',
      })
    },
  })
}

// Education hooks (similar pattern)
export function useEducation() {
  return useQuery({
    queryKey: ['education'],
    queryFn: () => workEducationApi.getEducation(),
  })
}

// Similar create, update, delete hooks for education...
export function useCreateEducation() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: EducationFormData) => workEducationApi.createEducation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education'] })
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] })
      toast({
        title: 'Success',
        description: 'Education added successfully.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add education.',
        variant: 'destructive',
      })
    },
  })
}

// Additional education hooks...
```

### Step 4: Work Experience Form Component (components/profile/WorkExperienceForm.tsx)

```typescript
import React, { useState } from 'react'
import { Plus, Edit, Trash2, Building } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { WorkExperience, WorkExperienceFormData } from '@/types/work-education'
import {
  useWorkExperiences,
  useCreateWorkExperience,
  useUpdateWorkExperience,
  useDeleteWorkExperience,
} from '@/hooks/useWorkEducation'
import { format } from 'date-fns'

interface WorkExperienceFormProps {
  isEditable?: boolean
}

export const WorkExperienceForm: React.FC<WorkExperienceFormProps> = ({
  isEditable = true,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingWork, setEditingWork] = useState<WorkExperience | null>(null)
  const [formData, setFormData] = useState<WorkExperienceFormData>({
    company_name: '',
    position_title: '',
    description: '',
    start_date: '',
    end_date: '',
    is_current: false,
    location: '',
  })

  const { data: workExperiences, isLoading } = useWorkExperiences()
  const createWorkExperience = useCreateWorkExperience()
  const updateWorkExperience = useUpdateWorkExperience()
  const deleteWorkExperience = useDeleteWorkExperience()

  const resetForm = () => {
    setFormData({
      company_name: '',
      position_title: '',
      description: '',
      start_date: '',
      end_date: '',
      is_current: false,
      location: '',
    })
    setEditingWork(null)
  }

  const openModal = (work?: WorkExperience) => {
    if (work) {
      setEditingWork(work)
      setFormData({
        company_name: work.company_name,
        position_title: work.position_title,
        description: work.description || '',
        start_date: work.start_date.split('T')[0], // Format for date input
        end_date: work.end_date ? work.end_date.split('T')[0] : '',
        is_current: work.is_current,
        location: work.location || '',
      })
    } else {
      resetForm()
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    resetForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Convert dates to ISO format
    const submitData = {
      ...formData,
      start_date: new Date(formData.start_date).toISOString(),
      end_date: formData.end_date ? new Date(formData.end_date).toISOString() : undefined,
    }

    try {
      if (editingWork) {
        await updateWorkExperience.mutateAsync({
          id: editingWork.id!,
          data: submitData,
        })
      } else {
        await createWorkExperience.mutateAsync(submitData)
      }
      closeModal()
    } catch (error) {
      // Error handling done in the hook
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this work experience?')) {
      await deleteWorkExperience.mutateAsync(id)
    }
  }

  const handleInputChange = (field: keyof WorkExperienceFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Clear end_date if is_current is true
      ...(field === 'is_current' && value ? { end_date: '' } : {}),
    }))
  }

  if (isLoading) {
    return <div className="animate-pulse bg-muted h-32 rounded"></div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Work Experience
          </CardTitle>
          {isEditable && (
            <Button onClick={() => openModal()} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Experience
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {workExperiences && workExperiences.length > 0 ? (
          <div className="space-y-4">
            {workExperiences.map((work) => (
              <div key={work.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold">{work.position_title}</h4>
                    <p className="text-primary font-medium">{work.company_name}</p>
                    {work.location && (
                      <p className="text-sm text-muted-foreground">{work.location}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      {format(new Date(work.start_date), 'MMM yyyy')} - {' '}
                      {work.is_current ? 'Present' : (
                        work.end_date ? format(new Date(work.end_date), 'MMM yyyy') : 'Unknown'
                      )}
                    </p>
                    {work.description && (
                      <p className="text-sm mt-2">{work.description}</p>
                    )}
                  </div>
                  {isEditable && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openModal(work)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(work.id!)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground italic text-center py-8">
            {isEditable
              ? 'No work experience added yet. Click "Add Experience" to get started.'
              : 'No work experience listed.'}
          </p>
        )}

        {/* Add/Edit Modal */}
        <Dialog open={isModalOpen} onOpenChange={closeModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingWork ? 'Edit Work Experience' : 'Add Work Experience'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position_title">Position Title *</Label>
                  <Input
                    id="position_title"
                    value={formData.position_title}
                    onChange={(e) => handleInputChange('position_title', e.target.value)}
                    placeholder="Software Engineer"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company *</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                    placeholder="Company Name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="San Francisco, CA"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                    disabled={formData.is_current}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_current"
                  checked={formData.is_current}
                  onCheckedChange={(checked) => handleInputChange('is_current', checked)}
                />
                <Label htmlFor="is_current">I currently work here</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your role and responsibilities..."
                  rows={4}
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.description.length}/1000 characters
                </p>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={
                    createWorkExperience.isPending || 
                    updateWorkExperience.isPending
                  }
                >
                  {editingWork ? 'Update' : 'Add'} Experience
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
```

### Step 5: Education Form Component (components/profile/EducationForm.tsx)

```typescript
// Similar structure to WorkExperienceForm.tsx but with education-specific fields
import React, { useState } from 'react'
import { GraduationCap, Plus, Edit, Trash2 } from 'lucide-react'
// ... similar imports and structure

export const EducationForm: React.FC<EducationFormProps> = ({ isEditable = true }) => {
  // Similar state management and handlers as WorkExperienceForm
  
  // Form includes:
  // - Institution Name (required)
  // - Degree (required)
  // - Field of Study (optional)
  // - Education Level (dropdown)
  // - Start/End dates
  // - Current education toggle
  // - GPA (optional, 0.0-4.0 validation)
  // - Description (optional)
  
  // Similar structure with education-specific validation and fields
}
```

### Step 6: Integration with Profile Page

Update the Profile page to include the forms:

```typescript
// In pages/Profile.tsx, add to the right column:
import { WorkExperienceForm } from '@/components/profile/WorkExperienceForm'
import { EducationForm } from '@/components/profile/EducationForm'

// In the profile content section:
<div className="space-y-6">
  <WorkExperienceForm isEditable={isOwnProfile} />
  <EducationForm isEditable={isOwnProfile} />
</div>
```

## Deliverables

- [ ] Work experience form component with full CRUD
- [ ] Education form component with full CRUD
- [ ] Proper date input handling
- [ ] Current position/education logic
- [ ] Form validation and error handling
- [ ] Responsive design
- [ ] Integration with profile page
- [ ] API service layer
- [ ] React hooks for data management
- [ ] Loading and error states

## Acceptance Criteria

1. **Form Functionality:**
   - Users can add, edit, and delete work experiences
   - Users can add, edit, and delete education records
   - Forms have proper validation
   - Current position/education logic works correctly

2. **Data Validation:**
   - Required fields enforced
   - Date validation (end date cannot be before start date)
   - GPA validation (0.0-4.0 for education)
   - Character limits respected

3. **User Experience:**
   - Intuitive form interface
   - Clear feedback messages
   - Loading states during operations
   - Confirmation for deletions

4. **Integration:**
   - Works seamlessly with profile page
   - Data syncs with backend APIs
   - Real-time updates in UI
   - Proper error handling

## Questions or Issues?

Contact:
- **Project Manager:** Daniel
- **Frontend Lead:** [TBD]
- **Backend Lead:** [For API integration]

## Next Steps After Completion

1. Test forms with various data scenarios
2. Integrate with profile completion tracking
3. Add export functionality for resume building
4. Implement form auto-save functionality
5. Add drag-and-drop reordering

---

**Status Updates:**
- [ ] Started: _________
- [ ] Types & API Service: _________
- [ ] React Hooks: _________
- [ ] Work Experience Form: _________
- [ ] Education Form: _________
- [ ] Profile Integration: _________
- [ ] Testing Complete: _________
- [ ] Completed: _________