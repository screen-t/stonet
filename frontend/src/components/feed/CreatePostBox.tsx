import { UserAvatar } from "@/components/ui/UserAvatar";
import { Button } from "@/components/ui/button";
import { Image, FileText, Calendar, BarChart3 } from "lucide-react";
import { useAuth } from "@/lib/auth";

export interface CreatePostBoxProps {
  onOpenModal: () => void;
}

export const CreatePostBox = ({ onOpenModal }: CreatePostBoxProps) => {
  const { user } = useAuth();
  
  const userFullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.email || "User";

  return (
    <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <UserAvatar
          name={userFullName}
          src={user?.avatar_url}
          size="md"
        />
        <button
          onClick={onOpenModal}
          className="flex-1 text-left px-4 py-2.5 rounded-full bg-secondary/50 text-muted-foreground hover:bg-secondary transition-colors"
        >
          What's on your mind?
        </button>
      </div>
      <div className="flex items-center gap-1 sm:gap-2 mt-3 pt-3 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-muted-foreground hover:text-primary gap-1 sm:gap-2 px-2 sm:px-3"
          onClick={onOpenModal}
        >
          <Image className="h-4 w-4 text-primary flex-shrink-0" />
          <span className="hidden sm:inline text-sm">Photo</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-muted-foreground hover:text-primary gap-1 sm:gap-2 px-2 sm:px-3"
          onClick={onOpenModal}
        >
          <FileText className="h-4 w-4 text-accent flex-shrink-0" />
          <span className="hidden sm:inline text-sm">Article</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-muted-foreground hover:text-primary gap-1 sm:gap-2 px-2 sm:px-3"
          onClick={onOpenModal}
        >
          <Calendar className="h-4 w-4 text-orange-500 flex-shrink-0" />
          <span className="hidden sm:inline text-sm">Event</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-muted-foreground hover:text-primary gap-1 sm:gap-2 px-2 sm:px-3"
          onClick={onOpenModal}
        >
          <BarChart3 className="h-4 w-4 text-pink-500 flex-shrink-0" />
          <span className="hidden sm:inline text-sm">Poll</span>
        </Button>
      </div>
    </div>
  );
};
