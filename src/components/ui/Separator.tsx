import React from "react";
import { cn } from "../../utils";

export interface SeparatorProps {
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export const Separator: React.FC<SeparatorProps> = ({
  orientation = "horizontal",
  className
}) => {
  return (
    <div
      className={cn(
        "bg-border shrink-0",
        orientation === "horizontal" ? "h-[1px] w-full my-3" : "w-[1px] h-full mx-3",
        className
      )}
    />
  );
};
