"use client";

import { useState } from "react";
import { X } from "lucide-react";

export function AlertBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-yellow-600 text-white px-4 py-3 relative">
      <div className="flex items-center justify-center gap-2 text-sm font-medium">
        <span className="text-center">
          This app is currently not functional on production due to API usage
          rejection by Spotify 😔
          <br />
          Please check how to run it locally{" "}
          <a
            href="https://github.com/ThisIsDjonathan/spotify-liker"
            target="_blank"
            className="text-blue-200 hover:underline"
          >
            here
          </a>
          .
        </span>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 top-1/2 -translate-y-1/2 hover:bg-red-700 rounded p-1 transition-colors"
          aria-label="Close banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
