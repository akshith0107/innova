import React from "react";
import { cn } from "../../utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = "rectangular",
  ...props
}) => {
  const variantMap = {
    text: "h-4 w-full rounded-md",
    circular: "rounded-full shrink-0",
    rectangular: "rounded-2xl w-full"
  };

  return (
    <div
      className={cn(
        "bg-surface-elevated/80 animate-pulse relative overflow-hidden",
        variantMap[variant],
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
    </div>
  );
};

export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = "md", className }) => {
  const sizeMap = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-3"
  };

  return (
    <span
      className={cn(
        "inline-block border-accent border-t-transparent rounded-full animate-spin",
        sizeMap[size],
        className
      )}
    />
  );
};
