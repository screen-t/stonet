import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Bookmark, FileText, Briefcase, Users } from "lucide-react";

const Saved = () => {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Saved Items</h1>
          <p className="text-muted-foreground">
            Access your bookmarked posts, articles, and connections.
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="articles">Articles</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="people">People</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            <Card className="p-12 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <div className="flex justify-center">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bookmark className="h-10 w-10 text-primary" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold">No Saved Posts</h2>
                <p className="text-muted-foreground">
                  Save posts you want to read later by clicking the bookmark icon.
                  They'll appear here for easy access.
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="articles" className="mt-6">
            <Card className="p-12 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <div className="flex justify-center">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="h-10 w-10 text-primary" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold">No Saved Articles</h2>
                <p className="text-muted-foreground">
                  Bookmark articles and resources to build your reading list.
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="jobs" className="mt-6">
            <Card className="p-12 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <div className="flex justify-center">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Briefcase className="h-10 w-10 text-primary" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold">No Saved Jobs</h2>
                <p className="text-muted-foreground">
                  Save job postings you're interested in and come back to them later.
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="people" className="mt-6">
            <Card className="p-12 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <div className="flex justify-center">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-10 w-10 text-primary" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold">No Saved Profiles</h2>
                <p className="text-muted-foreground">
                  Save profiles of people you want to reconnect with or follow up later.
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Saved;
