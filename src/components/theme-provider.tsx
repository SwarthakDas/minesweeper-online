"use client"
import React from "react";

export function ThemeProvider({ children }) {
  React.useEffect(() => {
    document.body.classList.add("bg-black");
    document.documentElement.classList.add("dark");
    return () => {
      document.body.classList.remove("bg-black");
      document.documentElement.classList.remove("dark");
    };
  }, []);

  return (
    <div className="text-white min-h-screen bg-black">
      {children}
    </div>
  );
}