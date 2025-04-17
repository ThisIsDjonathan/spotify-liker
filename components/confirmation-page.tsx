"use client";

import { useEffect, useState } from "react";
import { Music, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ConfirmationPage({ email }: { email: string }) {
  const [userMessage, setUserMessage] = useState<string>(
    "We're liking all songs in your playlists in the background."
  );
  const [progress, setProgress] = useState<number>(0);
  const [playlistCount, setPlaylistCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [title, setTitle] = useState<string>("Processing Started");

  useEffect(() => {
    if (playlistCount === 0) return;

    let timer: NodeJS.Timeout;
    let currentDelay = 1000;

    const incrementProgress = () => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + 1;

        if (newProgress >= playlistCount) {
          setIsLoading(false);
          return playlistCount;
        }

        // Increase the delay by 1 second for the next iteration
        currentDelay += 1000;

        // Schedule the next increment with the increased delay
        timer = setTimeout(incrementProgress, currentDelay);

        return newProgress;
      });
    };

    // Start the first increment with a 1-second interval
    timer = setTimeout(incrementProgress, currentDelay);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [playlistCount]);

  // This effect should only run once when the component mounts
  useEffect(() => {
    const startBackgroundProcess = async () => {
      try {
        const response = await fetch("/api/trigger-background-worker", {
          method: "POST",
        });

        if (!response.ok) {
          const responseBody = await response.json();
          if (response.status === 429) {
            setTitle("We are still processing your playlists 😅");
            setUserMessage(responseBody.userMessage);
            return;
          }
          throw new Error(
            responseBody.userMessage || "Failed to start background process"
          );
        }

        const responseBody = await response.json();
        const count = responseBody.playlistCount || 0;
        setPlaylistCount(count);
        setUserMessage(
          (prevMessage) => responseBody.userMessage || prevMessage
        );
      } catch (error) {
        console.error("Error starting background process:", error);
        const errorMsg =
          error instanceof Error ? error.message : "An error occurred 😱";
        setUserMessage(errorMsg);
      }
    };

    startBackgroundProcess();
    // Empty dependency array ensures this effect runs only once on mount
  }, []);

  const progressPercentage =
    playlistCount > 0 ? Math.min(100, (progress / playlistCount) * 100) : 0;

  return (
    <div className="flex-1 flex items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-md card-elegant rounded-xl p-8"
      >
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="mb-8"
          >
            <Music className="h-10 w-10 text-[#1ED760]" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="text-2xl font-light mb-2 text-center tracking-wide"
          >
            {title} {/* Dynamically display the title */}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="text-center text-gray-400 mb-6 text-sm space-y-4"
          >
            <>
              <p>{userMessage}</p>
              <p>
                You&apos;ll receive an email at{" "}
                <span className="text-[#1ED760]">{email}</span> when it&apos;s
                done.
              </p>

              {playlistCount > 0 && (
                <div className="w-full mt-4 space-y-2">
                  <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                    <motion.div
                      className="bg-[#1ED760] h-2.5 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    Processing {progress} of {playlistCount} playlists
                    {isLoading && (
                      <span className="inline-block ml-1">
                        <span className="animate-pulse">...</span>
                      </span>
                    )}
                  </p>
                </div>
              )}

              {playlistCount === 0 && (
                <div className="flex justify-center py-4">
                  <div className="animate-pulse flex items-center justify-center w-12 h-12 rounded-full bg-[#1ED760]/10">
                    <Music className="h-6 w-6 text-[#1ED760]" />
                  </div>
                </div>
              )}
            </>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="w-full mt-4"
          >
            <Link
              href="https://open.spotify.com/collection/tracks"
              target="_blank"
              className="spotify-button w-full flex items-center justify-center gap-2 text-sm"
            >
              <ExternalLink className="h-4 w-4" /> Open Spotify Liked Songs
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.7 }}
            className="w-full mt-4"
          ></motion.div>
        </div>
      </motion.div>
    </div>
  );
}
