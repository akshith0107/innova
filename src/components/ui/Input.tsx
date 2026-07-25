import React, { forwardRef } from "react";
import { cn } from "../../utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, leftIcon, rightIcon, error, ...props }, ref) => {
    return (
      <div className="w-full relative">
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-primary-muted pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full bg-surface-elevated text-primary text-sm rounded-xl border border-border px-3.5 py-2.5 outline-none transition-all placeholder:text-primary-muted/60 focus:border-accent focus:ring-1 focus:ring-accent",
              leftIcon && "pl-9",
              rightIcon && "pr-9",
              error && "border-status-danger focus:border-status-danger focus:ring-status-danger",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 text-primary-muted">{rightIcon}</span>
          )}
        </div>
        {error && <p className="text-xs text-status-danger mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={cn(
            "w-full bg-surface-elevated text-primary text-sm rounded-xl border border-border p-3.5 outline-none transition-all placeholder:text-primary-muted/60 focus:border-accent focus:ring-1 focus:ring-accent resize-none min-h-[100px]",
            error && "border-status-danger focus:border-status-danger focus:ring-status-danger",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-status-danger mt-1">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
