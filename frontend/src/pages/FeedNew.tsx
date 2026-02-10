import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { CreatePostBox } from "@/components/feed/CreatePostBox";
import { CreatePostModal } from "@/components/feed/CreatePostModal";
import { PostCard, PostData } from "@/components/feed/PostCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Sparkles, Users, Loader2, RefreshCw } from "lucide-react";
import { backendApi } from "@/lib/backend-api";
import { Button } from "@/components/ui/button";
import { Post } from '@/types/api';

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

const FeedNew = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"for_you" | "following">("for_you");
  const queryClient = useQueryClient();

  // Fetch feed based on active tab
  const { data: feedData, isLoading, error, refetch } = useQuery<Post[]>({
    queryKey: ['feed', activeTab],
    queryFn: () => backendApi.posts.getFeed(activeTab as 'for_you' | 'following', 50, 0),
    refetchInterval: 60000, // Refetch every minute
  });

  // Transform backend posts to PostData format
  const posts: PostData[] = (feedData || []).map((post: any) => {
    const firstName = post.author?.first_name || '';
    const lastName = post.author?.last_name || '';
    const fullName = [firstName, lastName].filter(Boolean).join(' ');
    
    return {
      id: post.id,
      author: {
        name: fullName || post.author?.username || "Unknown User",
        username: post.author?.username || "user",
        avatar: post.author?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${post.author?.username || 'user'}`,
        headline: post.author?.headline || "",
      },
      content: post.content,
      image: post.media?.[0]?.url,
      tags: post.hashtags?.map((tag: string) => `#${tag}`) || [],
      likes: post.like_count || 0,
      comments: post.comment_count || 0,
      shares: post.share_count || 0,
      isLiked: post.is_liked || false,
      isSaved: post.is_saved || false,
      visibility: post.visibility as "public" | "connections" | "private",
      createdAt: formatTimeAgo(new Date(post.created_at)),
    };
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value as "for_you" | "following");
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Create Post */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <CreatePostBox onOpenModal={() => setIsCreateModalOpen(true)} />
        </motion.div>

        {/* Feed Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="for_you" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                For You
              </TabsTrigger>
              <TabsTrigger value="following" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Following
              </TabsTrigger>
            </TabsList>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* For You Feed */}
          <TabsContent value="for_you" className="mt-6 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Failed to load feed</p>
                <Button onClick={() => refetch()} variant="outline" className="mt-4">
                  Try Again
                </Button>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg font-semibold">No posts yet</p>
                <p className="text-muted-foreground mt-2">
                  Be the first to create a post or connect with others!
                </p>
              </div>
            ) : (
              posts.map((post: any, index: number) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PostCard post={post} />
                </motion.div>
              ))
            )}
          </TabsContent>

          {/* Following Feed */}
          <TabsContent value="following" className="mt-6 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Failed to load feed</p>
                <Button onClick={() => refetch()} variant="outline" className="mt-4">
                  Try Again
                </Button>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg font-semibold">Your feed is empty</p>
                <p className="text-muted-foreground mt-2">
                  Start following people to see their posts here!
                </p>
              </div>
            ) : (
              posts.map((post: any, index: number) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PostCard post={post} />
                </motion.div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </AppLayout>
  );
};

export default FeedNew;
