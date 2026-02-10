import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { PostCardNew } from "@/components/feed/PostCardNew";
import { backendApi } from "@/lib/backend-api";
import { SearchResponse } from '@/types/api';
import {
  Search as SearchIcon,
  Users,
  FileText,
  Loader2,
  UserPlus,
} from "lucide-react";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [activeTab, setActiveTab] = useState("all");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      if (searchQuery) {
        setSearchParams({ q: searchQuery });
      } else {
        setSearchParams({});
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, setSearchParams]);

  // Search all
  const { data: allResults, isLoading: loadingAll } = useQuery<SearchResponse>({
    queryKey: ['search', 'all', debouncedQuery],
    queryFn: () => backendApi.search.searchAll(debouncedQuery, 20),
    enabled: !!debouncedQuery && activeTab === 'all',
  });

  // Search users
  const { data: usersResults, isLoading: loadingUsers } = useQuery<SearchResponse>({
    queryKey: ['search', 'users', debouncedQuery],
    queryFn: () => backendApi.search.searchUsers(debouncedQuery, 50, 0),
    enabled: !!debouncedQuery && activeTab === 'users',
  });

  // Search posts
  const { data: postsResults, isLoading: loadingPosts } = useQuery<SearchResponse>({
    queryKey: ['search', 'posts', debouncedQuery],
    queryFn: () => backendApi.search.searchPosts(debouncedQuery, 50, 0),
    enabled: !!debouncedQuery && activeTab === 'posts',
  });

  const isLoading = loadingAll || loadingUsers || loadingPosts;

  const renderUserCard = (user: any) => (
    <Card key={user.id} className="p-4">
      <div className="flex items-start gap-3">
        <Link to={`/profile/${user.id}`}>
          <UserAvatar
            src={user.avatar_url}
            name={`${user.first_name} ${user.last_name}`}
            size="md"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={`/profile/${user.id}`}>
            <h4 className="font-semibold hover:text-primary truncate">
              {user.first_name} {user.last_name}
            </h4>
          </Link>
          {user.username && (
            <p className="text-sm text-muted-foreground">@{user.username}</p>
          )}
          {user.headline && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {user.headline}
            </p>
          )}
          <Link to={`/profile/${user.id}`}>
            <Button size="sm" variant="outline" className="mt-3">
              <UserPlus className="w-4 h-4 mr-2" />
              View Profile
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );

  const renderEmptyState = (message: string) => (
    <div className="text-center py-12">
      <SearchIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
      <p className="text-lg font-semibold">No results found</p>
      <p className="text-muted-foreground mt-2">{message}</p>
    </div>
  );

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header & Search */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h1 className="text-3xl font-bold">Search</h1>
          
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search for people, posts, and more..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-lg h-12"
              autoFocus
            />
          </div>
        </motion.div>

        {/* Results */}
        {!debouncedQuery ? (
          <div className="text-center py-12">
            <SearchIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-semibold">Start searching</p>
            <p className="text-muted-foreground mt-2">
              Enter a keyword to find people and posts
            </p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-2xl grid-cols-3">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <SearchIcon className="w-4 h-4" />
                All
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                People
              </TabsTrigger>
              <TabsTrigger value="posts" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Posts
              </TabsTrigger>
            </TabsList>

            {/* All Results */}
            <TabsContent value="all" className="mt-6 space-y-6">
              {loadingAll ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {/* Users Section */}
                  {allResults?.users && allResults.users.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          People
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveTab('users')}
                        >
                          See all
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {allResults.users.slice(0, 4).map((user: any) => renderUserCard(user))}
                      </div>
                    </div>
                  )}

                  {/* Posts Section */}
                  {allResults?.posts && allResults.posts.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          Posts
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveTab('posts')}
                        >
                          See all
                        </Button>
                      </div>
                      <div className="space-y-4">
                        {allResults.posts.slice(0, 3).map((post: any) => (
                          <PostCardNew key={post.id} post={post} />
                        ))}
                      </div>
                    </div>
                  )}

                  {(!allResults?.users?.length && !allResults?.posts?.length) &&
                    renderEmptyState('Try searching with different keywords')
                  }
                </>
              )}
            </TabsContent>

            {/* Users Results */}
            <TabsContent value="users" className="mt-6">
              {loadingUsers ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : usersResults?.users && usersResults.users.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {usersResults.users.map((user: any, index: number) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {renderUserCard(user)}
                    </motion.div>
                  ))}
                </div>
              ) : (
                renderEmptyState('No people found matching your search')
              )}
            </TabsContent>

            {/* Posts Results */}
            <TabsContent value="posts" className="mt-6">
              {loadingPosts ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : postsResults?.posts && postsResults.posts.length > 0 ? (
                <div className="space-y-4">
                  {postsResults.posts.map((post: any, index: number) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <PostCardNew post={post} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                renderEmptyState('No posts found matching your search')
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppLayout>
  );
};

export default SearchPage;
