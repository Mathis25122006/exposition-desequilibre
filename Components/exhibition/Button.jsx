import React from "react";

export function Button({ children, onClick, variant, size, className }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded ${
        variant === "ghost" ? "bg-transparent border border-gray-400" : "bg-blue-500 text-white"
      } ${size === "icon" ? "p-2 w-10 h-10" : ""} ${className || ""}`}
    >
      {children}
    </button>
  );
}