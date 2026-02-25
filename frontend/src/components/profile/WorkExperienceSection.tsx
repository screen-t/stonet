import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Profile, WorkExperience } from '@/types/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { backendApi } from "@/lib/backend-api";
import { Briefcase, Plus, Pencil, Trash2, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface WorkExperienceSectionProps {
  userId: string;
  isOwnProfile: boolean;
}

export const WorkExperienceSection = ({ userId, isOwnProfile }: WorkExperienceSectionProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkExperience | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    start_date: "",
    end_date: "",
    is_current: false,
    description: "",
  });

  // Fetch work experience
  const { data: experiences = [], isLoading } = useQuery({
    queryKey: ['workExperience', userId],
    queryFn: async () => {
      const profile = isOwnProfile
        ? await backendApi.profile.getMyProfile()
        : await backendApi.profile.getProfile(userId);
      return (profile as any).work_experience || [];
    },
  });

  // Add/Update work experience
  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      if (editingItem) {
        return backendApi.profile.updateWorkExperience(editingItem.id, data);
      }
      return backendApi.profile.addWorkExperience(data);
    },
    onSuccess: () => {
      toast({ title: editingItem ? "Work experience updated!" : "Work experience added!" });
      queryClient.invalidateQueries({ queryKey: ['workExperience', userId] });
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
      closeModal();
    },
    onError: () => {
      toast({ title: "Failed to save", variant: "destructive" });
    },
  });

  // Delete work experience
  const deleteMutation = useMutation({
    mutationFn: (id: string) => backendApi.profile.deleteWorkExperience(id),
    onSuccess: () => {
      toast({ title: "Work experience deleted" });
      queryClient.invalidateQueries({ queryKey: ['workExperience', userId] });
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
    onError: () => {
      toast({ title: "Failed to delete", variant: "destructive" });
    },
  });

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      title: "",
      company: "",
      location: "",
      start_date: "",
      end_date: "",
      is_current: false,
      description: "",
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (item: WorkExperience) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      company: item.company,
      location: item.location || "",
      start_date: item.start_date,
      end_date: item.end_date || "",
      is_current: item.is_current,
      description: item.description || "",
    });
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Work Experience
          </h3>
          {isOwnProfile && (
            <Button size="sm" onClick={openAddModal}>
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : experiences.length === 0 ? (
            <p className="text-sm text-muted-foreground">No work experience added yet.</p>
          ) : (
            experiences.map((exp: WorkExperience) => (
              <div key={exp.id} className="border-l-2 border-primary pl-4 py-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold">{exp.title}</h4>
                    <p className="text-sm text-muted-foreground">{exp.company}</p>
                    {exp.location && (
                      <p className="text-xs text-muted-foreground">{exp.location}</p>
                    )}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {format(new Date(exp.start_date), 'MMM yyyy')} -{" "}
                        {exp.is_current ? "Present" : format(new Date(exp.end_date!), 'MMM yyyy')}
                      </span>
                    </div>
                    {exp.description && (
                      <p className="text-sm mt-2 text-muted-foreground">{exp.description}</p>
                    )}
                  </div>
                  {isOwnProfile && (
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEditModal(exp)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(exp.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Work Experience" : "Add Work Experience"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., New York, NY"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="month"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="month"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  disabled={formData.is_current}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_current"
                checked={formData.is_current}
                onChange={(e) => setFormData({ ...formData, is_current: e.target.checked })}
              />
              <Label htmlFor="is_current">I currently work here</Label>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder="Describe your responsibilities and achievements..."
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : editingItem ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
