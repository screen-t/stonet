import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showStatus?: boolean;
  isOnline?: boolean;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-lg",
};

const statusSizeClasses = {
  sm: "h-2 w-2 right-0 bottom-0",
  md: "h-2.5 w-2.5 right-0 bottom-0",
  lg: "h-3 w-3 right-0.5 bottom-0.5",
  xl: "h-4 w-4 right-1 bottom-1",
};

export const UserAvatar = ({
  src,
  name,
  size = "md",
  className,
  showStatus = false,
  isOnline = false,
}: UserAvatarProps) => {
  const initials = (name || "User")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative inline-flex">
      <Avatar
        className={cn(
          sizeClasses[size],
          "ring-2 ring-background shadow-sm",
          className
        )}
      >
        <AvatarImage src={src} alt={name} className="object-cover" />
        <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      {showStatus && (
        <span
          className={cn(
            "absolute rounded-full border-2 border-background",
            statusSizeClasses[size],
            isOnline ? "bg-accent" : "bg-muted-foreground"
          )}
        />
      )}
    </div>
  );
};
