import { useQuery } from "@tanstack/react-query";
import { backendApi } from "@/lib/backend-api";
import { PostCardNew } from "@/components/feed/PostCardNew";
import { Loader2 } from "lucide-react";
import { Post, PostsResponse } from '@/types/api';

interface ProfilePostsProps {
  username: string;
}

export const ProfilePosts = ({ username }: ProfilePostsProps) => {
  const { data: postsData, isLoading, error } = useQuery<PostsResponse>({
    queryKey: ['userPosts', username],
    queryFn: () => backendApi.posts.getUserPosts(username, 50, 0),
    enabled: !!username,
  });

  const posts = postsData?.posts || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load posts</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No posts yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post: Post) => (
        <PostCardNew key={post.id} post={post} />
      ))}
    </div>
  );
};
