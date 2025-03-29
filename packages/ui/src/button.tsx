"use client";

// In button.tsx
import React from "react";

export function Button({
  children,
  onClick,
  className = "",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}): JSX.Element {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
        disabled 
          ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
          : "bg-[#6a51a6] text-white hover:bg-[#5a4196] shadow-md hover:shadow-lg"
      } ${className}`}
    >
      {children}
    </button>
  );
}