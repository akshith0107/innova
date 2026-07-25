import React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "../../utils";

export interface CardProps extends HTMLMotionProps<"div"> {
  variant?: "glass" | "solid" | "bordered";
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  variant = "glass",
  interactive = false,
  children,
  ...props
}) => {
  const variantStyles = {
    glass: "glass-card text-primary shadow-glass",
    solid: "bg-surface-elevated text-primary border border-border",
    bordered: "bg-surface text-primary border border-border/80"
  };

  return (
    <motion.div
      whileHover={interactive ? { y: -2, transition: { duration: 0.15 } } : undefined}
      className={cn(
        "rounded-24 p-5 relative overflow-hidden transition-all duration-200",
        variantStyles[variant],
        interactive && "cursor-pointer hover:border-accent/40 hover:shadow-glow-accent/20",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};
