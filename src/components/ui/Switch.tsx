import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils";

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onCheckedChange,
  disabled = false,
  label,
  className
}) => {
  return (
    <label className={cn("inline-flex items-center gap-3 select-none cursor-pointer", disabled && "opacity-50 cursor-not-allowed", className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onCheckedChange(!checked)}
        className={cn(
          "w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out relative border border-border outline-none focus:ring-2 focus:ring-accent/50",
          checked ? "bg-accent border-accent shadow-glow-accent" : "bg-surface-elevated"
        )}
      >
        <motion.span
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="block w-5 h-5 rounded-full bg-white shadow-sm"
        />
      </button>
      {label && <span className="text-sm font-medium text-primary">{label}</span>}
    </label>
  );
};

export interface ToggleProps {
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  pressed,
  onPressedChange,
  children,
  className
}) => {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={() => onPressedChange(!pressed)}
      className={cn(
        "px-3 py-1.5 text-xs font-medium rounded-xl border transition-all select-none",
        pressed
          ? "bg-accent/20 text-accent border-accent/40"
          : "bg-surface-elevated text-primary-muted border-border hover:text-primary",
        className
      )}
    >
      {children}
    </button>
  );
};
