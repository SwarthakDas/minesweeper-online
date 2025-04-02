"use client"
import React from "react";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Apply global styles for black background
  React.useEffect(() => {
    // Add black background to body when component mounts
    document.body.classList.add("bg-black");
    document.documentElement.classList.add("dark");
    
    // Clean up when component unmounts
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