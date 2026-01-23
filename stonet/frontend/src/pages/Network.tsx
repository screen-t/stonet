import { useState } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Search,
  UserPlus,
  UserCheck,
  Users,
  Clock,
  X,
  Check,
} from "lucide-react";

interface ConnectionRequest {
  id: string;
  name: string;
  username: string;
  avatar: string;
  headline: string;
  mutualConnections: number;
}

interface Connection {
  id: string;
  name: string;
  username: string;
  avatar: string;
  headline: string;
  isOnline: boolean;
}

const pendingRequests: ConnectionRequest[] = [
  {
    id: "1",
    name: "David Park",
    username: "davidpark",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100",
    headline: "CTO at InnovateTech",
    mutualConnections: 12,
  },
  {
    id: "2",
    name: "Lisa Wang",
    username: "lisawang",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100",
    headline: "VP Engineering at CloudSystems",
    mutualConnections: 8,
  },
];

const connections: Connection[] = [
  {
    id: "1",
    name: "Sarah Chen",
    username: "sarahchen",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    headline: "CEO at TechVentures",
    isOnline: true,
  },
  {
    id: "2",
    name: "Marcus Johnson",
    username: "marcusj",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    headline: "Founder at StartupLab",
    isOnline: false,
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    username: "emilyrod",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
    headline: "VP Sales at CloudScale",
    isOnline: true,
  },
  {
    id: "4",
    name: "Alex Kim",
    username: "alexkim",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
    headline: "Engineering Lead at DataFlow",
    isOnline: false,
  },
];

const suggestions: Connection[] = [
  {
    id: "5",
    name: "Rachel Green",
    username: "rachelg",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
    headline: "Marketing Director at BrandCo",
    isOnline: true,
  },
  {
    id: "6",
    name: "Tom Wilson",
    username: "tomwilson",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
    headline: "Product Lead at ScaleUp",
    isOnline: false,
  },
  {
    id: "7",
    name: "Nina Patel",
    username: "ninapatel",
    avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100",
    headline: "Data Scientist at AI Labs",
    isOnline: true,
  },
];

const Network = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [requests, setRequests] = useState(pendingRequests);

  const handleAcceptRequest = (id: string) => {
    setRequests(requests.filter((r) => r.id !== id));
  };

  const handleDeclineRequest = (id: string) => {
    setRequests(requests.filter((r) => r.id !== id));
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">My Network</h1>
            <p className="text-muted-foreground">
              Manage your connections and grow your network
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search connections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Pending Requests */}
        {requests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Pending Requests
                <span className="ml-2 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs">
                  {requests.length}
                </span>
              </h2>
            </div>
            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50"
                >
                  <UserAvatar
                    name={request.name}
                    src={request.avatar}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{request.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {request.headline}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {request.mutualConnections} mutual connections
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleAcceptRequest(request.id)}
                      className="gap-1"
                    >
                      <Check className="h-4 w-4" />
                      Accept
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeclineRequest(request.id)}
                      className="h-9 w-9 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="connections" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="connections" className="gap-2">
              <UserCheck className="h-4 w-4" />
              Connections
            </TabsTrigger>
            <TabsTrigger value="followers" className="gap-2">
              <Users className="h-4 w-4" />
              Followers
            </TabsTrigger>
            <TabsTrigger value="following" className="gap-2">
              <Users className="h-4 w-4" />
              Following
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Suggestions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connections">
            <div className="grid sm:grid-cols-2 gap-4">
              {connections.map((connection, index) => (
                <motion.div
                  key={connection.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card rounded-xl border border-border p-4"
                >
                  <div className="flex items-start gap-3">
                    <UserAvatar
                      name={connection.name}
                      src={connection.avatar}
                      size="lg"
                      showStatus
                      isOnline={connection.isOnline}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{connection.name}</p>
                      <p className="text-sm text-muted-foreground">
                        @{connection.username}
                      </p>
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {connection.headline}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      Message
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1">
                      View Profile
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="followers">
            <EmptyState
              icon={Users}
              title="No followers yet"
              description="When people follow you, they'll appear here."
            />
          </TabsContent>

          <TabsContent value="following">
            <EmptyState
              icon={Users}
              title="Not following anyone"
              description="Start following people to see their updates in your feed."
              action={
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Find People
                </Button>
              }
            />
          </TabsContent>

          <TabsContent value="suggestions">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestions.map((person, index) => (
                <motion.div
                  key={person.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card rounded-xl border border-border p-4 text-center"
                >
                  <UserAvatar
                    name={person.name}
                    src={person.avatar}
                    size="xl"
                    className="mx-auto mb-3"
                  />
                  <p className="font-semibold">{person.name}</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    {person.headline}
                  </p>
                  <Button className="w-full gap-2">
                    <UserPlus className="h-4 w-4" />
                    Connect
                  </Button>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Network;
