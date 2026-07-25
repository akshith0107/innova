import React from "react";
import "../styles/style.css";

export default function SidePanel() {
  return (
    <div className="h-screen w-full bg-background text-primary p-4 flex flex-col">
      <h2 className="text-lg font-bold">PRAMAAN Side Panel</h2>
      <p className="text-xs text-primary-muted mt-2">Verification details panel.</p>
    </div>
  );
}
