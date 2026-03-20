import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Bookmark, Loader2 } from "lucide-react";
import { backendApi } from "@/lib/backend-api";
import { PostCardNew } from "@/components/feed/PostCardNew";
import { Post } from "@/types/api";

const Saved = () => {
  const { data: posts, isLoading, error } = useQuery<Post[]>({
    queryKey: ["savedPosts"],
    queryFn: () => backendApi.posts.getSavedPosts(50, 0),
  });

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-4 px-2">
        {/* Header */}
        <div className="space-y-1 pt-2">
          <h1 className="text-2xl font-bold">Saved Posts</h1>
          <p className="text-sm text-muted-foreground">
            Posts you've bookmarked for later.
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Failed to load saved posts.</p>
          </Card>
        )}

        {!isLoading && !error && posts?.length === 0 && (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bookmark className="h-10 w-10 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-bold">No Saved Posts</h2>
              <p className="text-muted-foreground">
                Save posts you want to read later by clicking the bookmark icon on any post.
              </p>
            </div>
          </Card>
        )}

        {!isLoading && posts && posts.length > 0 && (
          <div className="space-y-4 pb-20">
            {posts.map((post: Post) => (
              <PostCardNew key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Saved;
