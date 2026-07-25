import React from "react";
import { cn } from "../../utils";

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  maxHeight?: string | number;
}

export const ScrollArea: React.FC<ScrollAreaProps> = ({
  children,
  className,
  maxHeight,
  style,
  ...props
}) => {
  return (
    <div
      className={cn("overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20", className)}
      style={{ maxHeight: maxHeight ?? "100%", ...style }}
      {...props}
    >
      {children}
    </div>
  );
};
