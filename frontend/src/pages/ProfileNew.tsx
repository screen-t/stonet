import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { backendApi } from "@/lib/backend-api";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { WorkExperienceSection } from "@/components/profile/WorkExperienceSection";
import { EducationSection } from "@/components/profile/EducationSection";
import { SkillsSection } from "@/components/profile/SkillsSection";
import { ProfilePosts } from "@/components/profile/ProfilePosts";
import { Profile } from '@/types/api';
import {
  MapPin,
  Link as LinkIcon,
  Calendar,
  Users,
  Briefcase,
  Edit3,
  MessageSquare,
  UserPlus,
  Loader2,
  Mail,
  Globe,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ProfilePage = () => {
  const { userId } = useParams<{ userId?: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Determine which user profile to show
  const profileUserId = userId || user?.id;
  const isOwnProfile = !userId || userId === user?.id;

  // Fetch profile data
  const { data: profile, isLoading, error } = useQuery<Profile>({
    queryKey: ['profile', profileUserId],
    queryFn: async () => {
      if (isOwnProfile) {
        return backendApi.profile.getMyProfile() as Promise<Profile>;
      }
      return backendApi.profile.getProfile(profileUserId!) as Promise<Profile>;
    },
    enabled: !!profileUserId,
  });

  // Fetch connection status if viewing another user's profile
  const { data: connectionStatus } = useQuery({
    queryKey: ['connectionStatus', profileUserId],
    queryFn: () => backendApi.connections.getConnectionStatus(profileUserId!),
    enabled: !isOwnProfile && !!profileUserId,
  });

  // Connection actions
  const sendConnectionRequest = useMutation({
    mutationFn: () => backendApi.connections.sendRequest(profileUserId!),
    onSuccess: () => {
      toast({ title: "Connection request sent!" });
      queryClient.invalidateQueries({ queryKey: ['connectionStatus', profileUserId] });
    },
    onError: () => {
      toast({ title: "Failed to send request", variant: "destructive" });
    },
  });

  const removeConnection = useMutation({
    mutationFn: () => backendApi.connections.removeConnection(profileUserId!),
    onSuccess: () => {
      toast({ title: "Connection removed" });
      queryClient.invalidateQueries({ queryKey: ['connectionStatus', profileUserId] });
    },
    onError: () => {
      toast({ title: "Failed to remove connection", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (error || !profile) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">Profile not found</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Cover Image Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-48 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg overflow-hidden"
        >
          {profile.cover_url && (
            <img
              src={profile.cover_url}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
        </motion.div>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 -mt-20 relative">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <UserAvatar
                  src={profile.avatar_url}
                  name={`${profile.first_name} ${profile.last_name}`}
                  size="xl"
                  className="border-4 border-background"
                />
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold">
                      {profile.first_name} {profile.last_name}
                    </h1>
                    {profile.pronouns && (
                      <p className="text-sm text-muted-foreground">({profile.pronouns})</p>
                    )}
                    {profile.headline && (
                      <p className="text-lg text-muted-foreground mt-1">{profile.headline}</p>
                    )}
                    
                    {/* Location & Website */}
                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                      {profile.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{profile.location}</span>
                        </div>
                      )}
                      {profile.website && (
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-primary"
                        >
                          <LinkIcon className="w-4 h-4" />
                          <span>Website</span>
                        </a>
                      )}
                      {profile.email_visible && profile.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          <span>{profile.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex gap-6 mt-4 text-sm">
                      <div>
                        <span className="font-semibold">{profile.connections_count || 0}</span>{" "}
                        <span className="text-muted-foreground">Connections</span>
                      </div>
                      <div>
                        <span className="font-semibold">{profile.followers_count || 0}</span>{" "}
                        <span className="text-muted-foreground">Followers</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {isOwnProfile ? (
                      <Button onClick={() => setIsEditModalOpen(true)} variant="outline">
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <>
                        {connectionStatus?.status === 'accepted' ? (
                          <>
                            <Button variant="default">
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Message
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => removeConnection.mutate()}
                            >
                              Connected
                            </Button>
                          </>
                        ) : connectionStatus?.status === 'pending' ? (
                          <Button variant="outline" disabled>
                            Request Pending
                          </Button>
                        ) : (
                          <Button
                            onClick={() => sendConnectionRequest.mutate()}
                            disabled={sendConnectionRequest.isPending}
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Connect
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <p className="mt-4 text-sm text-muted-foreground whitespace-pre-wrap">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Profile Tabs */}
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <SkillsSection userId={profileUserId!} isOwnProfile={isOwnProfile} />
              
              {profile.current_position && (
                <Card className="p-6 mt-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Current Position
                  </h3>
                  <div>
                    <p className="font-medium">{profile.current_position}</p>
                    {profile.current_company && (
                      <p className="text-sm text-muted-foreground">{profile.current_company}</p>
                    )}
                  </div>
                </Card>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="posts">
            <ProfilePosts userId={profileUserId!} />
          </TabsContent>

          <TabsContent value="experience">
            <WorkExperienceSection userId={profileUserId!} isOwnProfile={isOwnProfile} />
          </TabsContent>

          <TabsContent value="education">
            <EducationSection userId={profileUserId!} isOwnProfile={isOwnProfile} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profileData={profile}
      />
    </AppLayout>
  );
};

export default ProfilePage;
