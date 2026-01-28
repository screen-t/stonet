import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Image,
  Video,
  BarChart3,
  Link as LinkIcon,
  Globe,
  Users,
  Lock,
  X,
  Smile,
  Hash,
  AtSign,
  Bold,
  Italic,
  List,
  Link2,
  Calendar,
  Save,
  Trash2,
  Send,
  ImageIcon,
} from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: {
    content: string;
    visibility: string;
    image?: string;
  }) => void;
}

export const CreatePostModal = ({
  isOpen,
  onClose,
  onSubmit,
}: CreatePostModalProps) => {
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [image, setImage] = useState<string | null>(null);
  const [video, setVideo] = useState<string | null>(null);
  const [poll, setPoll] = useState<{ question: string; options: string[] } | null>(null);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();
  const [showSchedule, setShowSchedule] = useState(false);
  const [mediaType, setMediaType] = useState<"image" | "video" | "poll" | null>(null);

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit?.({
      content,
      visibility,
      image: image || undefined,
    });
    setContent("");
    setImage(null);
    setVideo(null);
    setPoll(null);
    setScheduledDate(undefined);
    setMediaType(null);
    onClose();
  };

  const handleSaveDraft = () => {
    // Save draft logic
    alert("Draft saved!");
    onClose();
  };

  const handleDiscard = () => {
    if (content.trim() || image || video || poll) {
      if (confirm("Are you sure you want to discard this post?")) {
        setContent("");
        setImage(null);
        setVideo(null);
        setPoll(null);
        onClose();
      }
    } else {
      onClose();
    }
  };

  const insertFormatting = (format: string) => {
    const textarea = document.querySelector("textarea");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    let formattedText = "";
    switch (format) {
      case "bold":
        formattedText = `**${selectedText || "bold text"}**`;
        break;
      case "italic":
        formattedText = `*${selectedText || "italic text"}*`;
        break;
      case "link":
        formattedText = `[${selectedText || "link text"}](url)`;
        break;
    }

    const newContent =
      content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);
  };

  const characterLimit = 2000;
  const remainingChars = characterLimit - content.length;

  return (
    <Dialog open={isOpen} onOpenChange={handleDiscard}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Create Post</DialogTitle>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveDraft}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save Draft
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDiscard}
                className="gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Discard
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Author Info */}
          <div className="flex items-center gap-3">
            <UserAvatar
              name="John Doe"
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"
              size="md"
            />
            <div>
              <p className="font-semibold">John Doe</p>
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger className="h-7 w-auto gap-2 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <Globe className="h-3 w-3" />
                      Public
                    </div>
                  </SelectItem>
                  <SelectItem value="connections">
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3" />
                      Connections
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div className="flex items-center gap-2">
                      <Lock className="h-3 w-3" />
                      Only me
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Text Formatting Toolbar */}
          <div className="flex items-center gap-1 p-2 border rounded-lg bg-muted/30">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertFormatting("bold")}
              title="Bold"
              className="h-8 w-8 p-0"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertFormatting("italic")}
              title="Italic"
              className="h-8 w-8 p-0"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertFormatting("link")}
              title="Insert Link"
              className="h-8 w-8 p-0"
            >
              <Link2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              title="Bullet List"
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
            <div className="flex-1" />
            <span className="text-xs text-muted-foreground">
              Use Markdown formatting
            </span>
          </div>

          {/* Content Input */}
          <Textarea
            placeholder="What's on your mind? Share your insights, ask questions, or start a conversation...

Tips:
• Use **bold** or *italic* for emphasis
• Add #hashtags to reach more people
• @mention colleagues to notify them"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-40 resize-none border-0 focus-visible:ring-0 text-base placeholder:text-muted-foreground/60"
            maxLength={characterLimit}
          />

          {/* Image Preview */}
          <AnimatePresence>
            {image && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative rounded-lg overflow-hidden border border-border"
              >
                <img
                  src={image}
                  alt="Upload preview"
                  className="w-full h-64 object-cover"
                />
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() => {
                    setImage(null);
                    setMediaType(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {video && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative rounded-lg overflow-hidden border border-border bg-muted p-8 text-center"
              >
                <Video className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Video attached</p>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() => {
                    setVideo(null);
                    setMediaType(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {poll && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative rounded-lg border border-border p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Poll</h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      setPoll(null);
                      setMediaType(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  placeholder="Ask a question..."
                  value={poll.question}
                  onChange={(e) =>
                    setPoll({ ...poll, question: e.target.value })
                  }
                  className="mb-2"
                />
                {poll.options.map((option, index) => (
                  <Input
                    key={index}
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...poll.options];
                      newOptions[index] = e.target.value;
                      setPoll({ ...poll, options: newOptions });
                    }}
                    className="mb-2"
                  />
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPoll({ ...poll, options: [...poll.options, ""] })
                  }
                  disabled={poll.options.length >= 4}
                >
                  Add Option
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scheduled Post */}
          {scheduledDate && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm">
                Scheduled for {format(scheduledDate, "PPP 'at' p")}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 ml-auto"
                onClick={() => setScheduledDate(undefined)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center gap-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-primary gap-2"
                    title="Add image"
                  >
                    <ImageIcon className="h-5 w-5" />
                    <span className="hidden sm:inline text-sm">Image</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="text-sm"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setImage(
                          "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800"
                        );
                        setMediaType("image");
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>

              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary gap-2"
                title="Add video"
                onClick={() => {
                  if (!mediaType || mediaType === "video") {
                    setVideo("video.mp4");
                    setMediaType("video");
                    setImage(null);
                    setPoll(null);
                  }
                }}
              >
                <Video className="h-5 w-5" />
                <span className="hidden sm:inline text-sm">Video</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary gap-2"
                title="Create poll"
                onClick={() => {
                  if (!mediaType || mediaType === "poll") {
                    setPoll({ question: "", options: ["", ""] });
                    setMediaType("poll");
                    setImage(null);
                    setVideo(null);
                  }
                }}
              >
                <BarChart3 className="h-5 w-5" />
                <span className="hidden sm:inline text-sm">Poll</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary gap-2"
                title="Add emoji"
              >
                <Smile className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary gap-2"
                title="Add hashtag"
              >
                <Hash className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary gap-2"
                title="Mention someone"
              >
                <AtSign className="h-5 w-5" />
              </Button>

              <Popover open={showSchedule} onOpenChange={setShowSchedule}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-primary gap-2"
                    title="Schedule post"
                  >
                    <Calendar className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={scheduledDate}
                    onSelect={(date) => {
                      setScheduledDate(date);
                      setShowSchedule(false);
                    }}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`text-xs ${
                  remainingChars < 100
                    ? "text-destructive font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                {remainingChars}
              </span>
              <Button
                onClick={handleSubmit}
                disabled={!content.trim()}
                size="sm"
                className="gap-2"
              >
                {scheduledDate ? (
                  <>
                    <Calendar className="h-4 w-4" />
                    Schedule
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Post
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
