import React from "react";
import { cn } from "../../utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "danger" | "accent" | "neutral";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "neutral",
  size = "md",
  children,
  ...props
}) => {
  const variantMap = {
    success: "bg-status-success/15 text-status-success border-status-success/30",
    warning: "bg-status-warning/15 text-status-warning border-status-warning/30",
    danger: "bg-status-danger/15 text-status-danger border-status-danger/30",
    accent: "bg-accent/15 text-accent border-accent/30",
    neutral: "bg-white/5 text-primary-muted border-border"
  };

  const sizeMap = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-mono font-medium rounded-full border border-solid tracking-tight shrink-0 select-none",
        variantMap[variant],
        sizeMap[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  icon?: React.ReactNode;
}

export const Chip: React.FC<ChipProps> = ({
  className,
  active = false,
  icon,
  children,
  ...props
}) => {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 select-none",
        active
          ? "bg-accent text-white border-accent shadow-glow-accent"
          : "bg-surface-elevated text-primary-muted border-border hover:text-primary hover:border-white/20",
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0 text-current">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
