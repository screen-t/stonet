import { useState } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  MessageCircle,
  UserPlus,
  Share2,
  Bell,
  Check,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "like" | "comment" | "connection" | "share" | "mention";
  user: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  isRead: boolean;
  postPreview?: string;
}

const notifications: Notification[] = [
  {
    id: "1",
    type: "like",
    user: {
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    },
    content: "liked your post",
    timestamp: "2m ago",
    isRead: false,
    postPreview: "Excited to announce that TechVentures just closed...",
  },
  {
    id: "2",
    type: "connection",
    user: {
      name: "David Park",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100",
    },
    content: "sent you a connection request",
    timestamp: "15m ago",
    isRead: false,
  },
  {
    id: "3",
    type: "comment",
    user: {
      name: "Marcus Johnson",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    },
    content: "commented on your post",
    timestamp: "1h ago",
    isRead: false,
    postPreview: "Great insights! I completely agree with point #3...",
  },
  {
    id: "4",
    type: "share",
    user: {
      name: "Emily Rodriguez",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
    },
    content: "shared your post",
    timestamp: "3h ago",
    isRead: true,
  },
  {
    id: "5",
    type: "mention",
    user: {
      name: "Alex Kim",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
    },
    content: "mentioned you in a comment",
    timestamp: "5h ago",
    isRead: true,
    postPreview: "@johndoe What do you think about this approach?",
  },
  {
    id: "6",
    type: "like",
    user: {
      name: "Rachel Green",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
    },
    content: "and 12 others liked your post",
    timestamp: "1d ago",
    isRead: true,
  },
];

const notificationIcons = {
  like: Heart,
  comment: MessageCircle,
  connection: UserPlus,
  share: Share2,
  mention: MessageCircle,
};

const notificationColors = {
  like: "text-pink-500 bg-pink-500/10",
  comment: "text-primary bg-primary/10",
  connection: "text-accent bg-accent/10",
  share: "text-orange-500 bg-orange-500/10",
  mention: "text-purple-500 bg-purple-500/10",
};

const Notifications = () => {
  const [notificationList, setNotificationList] = useState(notifications);

  const unreadCount = notificationList.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotificationList(notificationList.map((n) => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: string) => {
    setNotificationList(
      notificationList.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      )
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bell className="h-6 w-6" />
              Notifications
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-sm">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-muted-foreground">
              Stay updated on your network activity
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" onClick={markAllAsRead} className="gap-2">
              <Check className="h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="mentions">Mentions</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-2">
            {notificationList.map((notification, index) => {
              const Icon = notificationIcons[notification.type];
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => markAsRead(notification.id)}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-xl border border-border cursor-pointer transition-colors",
                    notification.isRead
                      ? "bg-card hover:bg-secondary/50"
                      : "bg-primary/5 border-primary/20 hover:bg-primary/10"
                  )}
                >
                  <div className="relative">
                    <UserAvatar
                      name={notification.user.name}
                      src={notification.user.avatar}
                      size="md"
                    />
                    <div
                      className={cn(
                        "absolute -bottom-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center",
                        notificationColors[notification.type]
                      )}
                    >
                      <Icon className="h-3 w-3" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p>
                      <span className="font-semibold">
                        {notification.user.name}
                      </span>{" "}
                      <span className="text-muted-foreground">
                        {notification.content}
                      </span>
                    </p>
                    {notification.postPreview && (
                      <p className="text-sm text-muted-foreground mt-1 truncate">
                        "{notification.postPreview}"
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.timestamp}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                  )}
                  <Button variant="ghost" size="icon" className="flex-shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </motion.div>
              );
            })}
          </TabsContent>

          <TabsContent value="unread" className="space-y-2">
            {notificationList
              .filter((n) => !n.isRead)
              .map((notification, index) => {
                const Icon = notificationIcons[notification.type];
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => markAsRead(notification.id)}
                    className="flex items-start gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20 cursor-pointer hover:bg-primary/10 transition-colors"
                  >
                    <div className="relative">
                      <UserAvatar
                        name={notification.user.name}
                        src={notification.user.avatar}
                        size="md"
                      />
                      <div
                        className={cn(
                          "absolute -bottom-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center",
                          notificationColors[notification.type]
                        )}
                      >
                        <Icon className="h-3 w-3" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p>
                        <span className="font-semibold">
                          {notification.user.name}
                        </span>{" "}
                        <span className="text-muted-foreground">
                          {notification.content}
                        </span>
                      </p>
                      {notification.postPreview && (
                        <p className="text-sm text-muted-foreground mt-1 truncate">
                          "{notification.postPreview}"
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.timestamp}
                      </p>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                  </motion.div>
                );
              })}
          </TabsContent>

          <TabsContent value="mentions" className="space-y-2">
            {notificationList
              .filter((n) => n.type === "mention")
              .map((notification, index) => {
                const Icon = notificationIcons[notification.type];
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => markAsRead(notification.id)}
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-xl border border-border cursor-pointer transition-colors",
                      notification.isRead
                        ? "bg-card hover:bg-secondary/50"
                        : "bg-primary/5 border-primary/20 hover:bg-primary/10"
                    )}
                  >
                    <div className="relative">
                      <UserAvatar
                        name={notification.user.name}
                        src={notification.user.avatar}
                        size="md"
                      />
                      <div
                        className={cn(
                          "absolute -bottom-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center",
                          notificationColors[notification.type]
                        )}
                      >
                        <Icon className="h-3 w-3" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p>
                        <span className="font-semibold">
                          {notification.user.name}
                        </span>{" "}
                        <span className="text-muted-foreground">
                          {notification.content}
                        </span>
                      </p>
                      {notification.postPreview && (
                        <p className="text-sm text-muted-foreground mt-1 truncate">
                          "{notification.postPreview}"
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.timestamp}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Notifications;
