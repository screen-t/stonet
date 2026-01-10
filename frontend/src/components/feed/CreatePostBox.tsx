import { useState } from "react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Button } from "@/components/ui/button";
import { Image, FileText, Calendar, BarChart3 } from "lucide-react";

interface CreatePostBoxProps {
  onOpenModal: () => void;
}

export const CreatePostBox = ({ onOpenModal }: CreatePostBoxProps) => {
  return (
    <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <UserAvatar
          name="John Doe"
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"
          size="md"
        />
        <button
          onClick={onOpenModal}
          className="flex-1 text-left px-4 py-2.5 rounded-full bg-secondary/50 text-muted-foreground hover:bg-secondary transition-colors"
        >
          What's on your mind?
        </button>
      </div>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-muted-foreground hover:text-primary gap-2"
          onClick={onOpenModal}
        >
          <Image className="h-4 w-4 text-primary" />
          Photo
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-muted-foreground hover:text-primary gap-2"
          onClick={onOpenModal}
        >
          <FileText className="h-4 w-4 text-accent" />
          Article
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-muted-foreground hover:text-primary gap-2"
          onClick={onOpenModal}
        >
          <Calendar className="h-4 w-4 text-orange-500" />
          Event
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-muted-foreground hover:text-primary gap-2"
          onClick={onOpenModal}
        >
          <BarChart3 className="h-4 w-4 text-pink-500" />
          Poll
        </Button>
      </div>
    </div>
  );
};
