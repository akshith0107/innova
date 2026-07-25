import React, { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "../../utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-white hover:bg-accent-hover shadow-glow-accent border border-accent/40",
        secondary:
          "bg-surface-elevated text-primary border border-border hover:bg-white/5 hover:border-white/20",
        outline:
          "bg-transparent text-primary border border-border hover:bg-white/5 hover:border-accent/40",
        ghost:
          "bg-transparent text-primary-muted hover:text-primary hover:bg-white/5",
        danger:
          "bg-status-danger/20 text-status-danger border border-status-danger/30 hover:bg-status-danger/30"
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-xl gap-1.5",
        md: "h-10 px-4 text-sm rounded-2xl gap-2",
        lg: "h-12 px-6 text-base rounded-24 gap-2.5",
        icon: "h-9 w-9 p-0 rounded-xl"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "size"> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | string | any;
  size?: "sm" | "md" | "lg" | "icon" | string | any;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, isLoading, leftIcon, rightIcon, children, disabled, ...props },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
        className={cn(buttonVariants({ variant: variant as any, size: size as any, className }))}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        {children && <span>{children}</span>}
        {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export interface IconButtonProps extends Omit<ButtonProps, "children" | "size"> {
  icon: React.ReactNode;
  size?: "sm" | "md" | "lg" | string | any;
  label: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, size = "md", className, ...props }, ref) => {
    const iconSizeMap: Record<string, string> = {
      sm: "h-7 w-7 text-xs rounded-lg",
      md: "h-9 w-9 text-sm rounded-xl",
      lg: "h-11 w-11 text-base rounded-2xl"
    };

    return (
      <Button
        ref={ref}
        variant="ghost"
        className={cn("p-0 justify-center shrink-0", iconSizeMap[size] || "h-9 w-9 text-sm rounded-xl", className)}
        aria-label={label}
        {...props}
      >
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = "IconButton";
