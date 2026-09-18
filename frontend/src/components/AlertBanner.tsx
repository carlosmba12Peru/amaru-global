// src/components/AlertBanner.tsx
"use client";

import React from "react";

interface AlertBannerProps {
  message: string;
  severity?: "info" | "warning" | "danger";
  onClose?: () => void;
}

export default function AlertBanner({
  message,
  severity = "danger",
  onClose,
}: AlertBannerProps) {
  const bgClass = {
    info: "bg-blue-950 border-blue-700 text-blue-300",
    warning: "bg-amber-950 border-amber-700 text-amber-300",
    danger: "bg-red-950 border-red-700 text-red-300",
  }[severity];

  return (
    <div
      className={`${bgClass} border p-4 rounded-md flex items-start space-x-3 animate-slide-down`}
    >
      <div className="flex-1 text-sm">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 text-xs text-opacity-70 hover:text-opacity-100"
        >
          ✕
        </button>
      )}
    </div>
  );
}

/*
  Tailwind animation (add to globals.css or Tailwind config):
  @keyframes slide-down {
    from { transform: translateY(-10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  .animate-slide-down { animation: slide-down 0.3s ease-out; }
*/
