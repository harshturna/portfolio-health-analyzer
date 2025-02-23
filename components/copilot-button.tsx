"use client";

import Link from "next/link";
import { Bot } from "lucide-react";
import { useState, useEffect } from "react";

import { cn } from "@/lib/utils";

interface CopilotRippleProps extends React.HTMLAttributes<HTMLDivElement> {
  iconSize?: number;
  iconColor?: string;
  borderColor?: string;
  inset?: string;
}

export default function CopilotButton({
  iconSize = 24,
  iconColor = "#666",
  borderColor = "#ddd",
  inset = "2px",
}: CopilotRippleProps) {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 2400);

    return () => clearTimeout(timer);
  }, []);

  const customBorderStyle = {
    borderColor,
  };
  const insetStyle = {
    top: `-${inset}`,
    bottom: `-${inset}`,
    left: `-${inset}`,
    right: `-${inset}`,
  };

  return (
    <Link href="/chat" className="mb-8 md:mb-0">
      <div
        className={cn(
          "group relative flex items-center justify-center w-[4.5rem] h-[4.5rem] border border-gray-300 rounded-[50%]"
        )}
      >
        <Bot size={iconSize} color={iconColor} className="absolute top-4" />
        {isAnimating && (
          <div
            className={cn(
              "absolute -inset-4 animate-ping rounded-full border-2"
            )}
            style={{ ...customBorderStyle, ...insetStyle }}
          />
        )}
        <span className="absolute bottom-4 text-xs text-black/60 font-semibold">
          Copilot
        </span>
      </div>
    </Link>
  );
}
