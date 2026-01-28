import { useState } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Button } from "@/components/ui/button";
import { SkillTag } from "@/components/ui/SkillTag";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard, PostData } from "@/components/feed/PostCard";
import {
  MapPin,
  Link as LinkIcon,
  Calendar,
  Users,
  Briefcase,
  Edit3,
  MessageSquare,
  UserPlus,
} from "lucide-react";

const profileData = {
  name: "John Doe",
  username: "johndoe",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
  headline: "Product Manager at Nexus | Building the future of professional networking",
  bio: "Passionate about creating products that connect people and drive business growth. Previously at Google, Microsoft. Stanford MBA.",
  location: "San Francisco, CA",
  website: "johndoe.com",
  joinedDate: "January 2024",
  connections: 1247,
  followers: 3892,
  following: 428,
  skills: [
    "Product Management",
    "Strategy",
    "Enterprise SaaS",
    "Go-to-Market",
    "User Research",
    "Data Analysis",
  ],
  experience: [
    {
      company: "Nexus",
      role: "Product Manager",
      duration: "2024 - Present",
      logo: "N",
    },
    {
      company: "Google",
      role: "Senior PM",
      duration: "2021 - 2024",
      logo: "G",
    },
    {
      company: "Microsoft",
      role: "PM",
      duration: "2018 - 2021",
      logo: "M",
    },
  ],
};

const userPosts: PostData[] = [
  {
    id: "1",
    author: {
      name: "John Doe",
      username: "johndoe",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
      headline: "Product Manager at Nexus",
    },
    content:
      "Thrilled to join Nexus as a Product Manager! 🎉\n\nAfter 6 amazing years at Google and Microsoft, I'm ready for a new adventure. Excited to help build the future of professional networking.\n\nIf you're in the Bay Area, let's grab coffee!",
    likes: 156,
    comments: 28,
    shares: 12,
    isLiked: false,
    isSaved: false,
    visibility: "public",
    createdAt: "1d ago",
  },
  {
    id: "2",
    author: {
      name: "John Doe",
      username: "johndoe",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
      headline: "Product Manager at Nexus",
    },
    content:
      "The best product advice I ever received:\n\n\"Don't fall in love with your solution. Fall in love with the problem.\"\n\nThis mindset shift changed everything for me. When you're obsessed with the problem, pivoting feels like progress, not failure.",
    tags: ["#ProductManagement", "#Advice"],
    likes: 324,
    comments: 45,
    shares: 23,
    isLiked: true,
    isSaved: false,
    visibility: "public",
    createdAt: "3d ago",
  },
];

const Profile = () => {
  const [isOwnProfile] = useState(true);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border overflow-hidden"
        >
          {/* Banner */}
          <div className="h-32 bg-gradient-primary relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6bTAtMTJjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="relative -mt-16 mb-4">
              <UserAvatar
                name={profileData.name}
                src={profileData.avatar}
                size="xl"
                className="ring-4 ring-card"
              />
            </div>

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{profileData.name}</h1>
                <p className="text-muted-foreground">@{profileData.username}</p>
                <p className="text-foreground mt-2">{profileData.headline}</p>

                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profileData.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <LinkIcon className="h-4 w-4" />
                    <a
                      href={`https://${profileData.website}`}
                      className="text-primary hover:underline"
                    >
                      {profileData.website}
                    </a>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {profileData.joinedDate}
                  </span>
                </div>

                <div className="flex items-center gap-4 mt-4">
                  <button className="hover:underline">
                    <span className="font-semibold">{profileData.connections.toLocaleString()}</span>{" "}
                    <span className="text-muted-foreground">connections</span>
                  </button>
                  <button className="hover:underline">
                    <span className="font-semibold">{profileData.followers.toLocaleString()}</span>{" "}
                    <span className="text-muted-foreground">followers</span>
                  </button>
                  <button className="hover:underline">
                    <span className="font-semibold">{profileData.following}</span>{" "}
                    <span className="text-muted-foreground">following</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isOwnProfile ? (
                  <Button variant="outline" className="gap-2">
                    <Edit3 className="h-4 w-4" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button className="gap-2">
                      <UserPlus className="h-4 w-4" />
                      Connect
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Message
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4">
            {userPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </TabsContent>

          <TabsContent value="about">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border p-6 space-y-6"
            >
              <div>
                <h3 className="font-semibold mb-3">About</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {profileData.bio}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Experience
                </h3>
                <div className="space-y-4">
                  {profileData.experience.map((exp, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                        {exp.logo}
                      </div>
                      <div>
                        <p className="font-medium">{exp.role}</p>
                        <p className="text-muted-foreground">{exp.company}</p>
                        <p className="text-sm text-muted-foreground">
                          {exp.duration}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="skills">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border p-6"
            >
              <h3 className="font-semibold mb-4">Skills & Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {profileData.skills.map((skill) => (
                  <SkillTag key={skill} skill={skill} variant="primary" />
                ))}
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="connections">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Connections
                </h3>
                <Button variant="ghost" size="sm">
                  See all
                </Button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
                  >
                    <UserAvatar
                      name={`User ${i}`}
                      src={`https://i.pravatar.cc/100?img=${i + 20}`}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">Connection {i}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        Role at Company
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Message
                    </Button>
                  </div>
                ))}
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Profile;
