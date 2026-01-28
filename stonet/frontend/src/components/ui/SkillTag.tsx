import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface SkillTagProps {
  skill: string;
  onRemove?: () => void;
  variant?: "default" | "primary" | "outline";
  size?: "sm" | "md";
}

const variantClasses = {
  default: "bg-secondary text-secondary-foreground",
  primary: "bg-primary/10 text-primary border border-primary/20",
  outline: "bg-transparent border border-border text-foreground",
};

const sizeClasses = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-3 py-1",
};

export const SkillTag = ({
  skill,
  onRemove,
  variant = "default",
  size = "md",
}: SkillTagProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium transition-colors",
        variantClasses[variant],
        sizeClasses[size]
      )}
    >
      {skill}
      {onRemove && (
        <button
          onClick={onRemove}
          className="hover:bg-foreground/10 rounded-full p-0.5 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
};
