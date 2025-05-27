"use client";

import { useEffect, useState } from "react";
import { Music, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface JobStatus {
  status: string;
  progress: number;
  result: any;
  failedReason?: string;
}

export default function ConfirmationPage({ email }: { email: string }) {
  const [userMessage, setUserMessage] = useState<string>(
    "We're liking all songs in your playlists in the background.",
  );
  const [progress, setProgress] = useState<number>(0);
  const [playlistCount, setPlaylistCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [title, setTitle] = useState<string>("Background Processing Started");
  const [jobId, setJobId] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const fetchJobStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/job-status?jobId=${id}`);
      const data: JobStatus = await res.json();

      if (res.status === 404) {
        setTitle("Job not found");
        setUserMessage("We couldn't find your background task. Please try again.");
        setIsLoading(false);
        return;
      }

      setProgress(data.progress || 0);

      if (data.status === "completed") {
        setIsLoading(false);
        setTitle("All songs liked! 🎉");
        setUserMessage("We've finished processing your playlists.");
        clearInterval(pollingInterval!);
      }

      if (data.status === "failed") {
        setIsLoading(false);
        setTitle("Something went wrong 😢");
        setUserMessage(data.failedReason || "The process failed.");
        clearInterval(pollingInterval!);
      }
    } catch (err) {
      console.error("Failed to fetch job status:", err);
      setIsLoading(false);
      setTitle("Error");
      setUserMessage("An error occurred while fetching job status.");
    }
  };

  useEffect(() => {
    const startProcess = async () => {
      try {
        const res = await fetch("/api/trigger-background-worker", {
          method: "POST",
        });

        if (!res.ok) {
          const data = await res.json();
          if (res.status === 429) {
            setTitle("We are still processing your playlists 😅");
            setUserMessage(data.userMessage);
            return;
          }

          throw new Error(data.userMessage || "Failed to start background process");
        }

        const data = await res.json();
        const count = data.playlistCount || 0;
        const jobId = data.jobId?.toString();

        if (jobId) {
          setJobId(jobId);
          setPlaylistCount(count);
          setUserMessage((prev) => data.userMessage || prev);
          const interval = setInterval(() => fetchJobStatus(jobId), 2000);
          setPollingInterval(interval);
        } else {
          throw new Error("No jobId returned");
        }
      } catch (err) {
        console.error("Error starting background process:", err);
        const msg = err instanceof Error ? err.message : "An error occurred 😱";
        setUserMessage(msg);
        setTitle("Error Starting Process 😢");
        setIsLoading(false);
      }
    };

    startProcess();
  }, []);

  const progressPercentage =
    playlistCount > 0 ? Math.min(100, (progress / playlistCount) * 100) : progress;

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
            {title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="text-center text-gray-400 mb-6 text-sm space-y-4"
          >
            <>
              <p>{userMessage}</p>
              {isLoading && (
                <p>
                  You&apos;ll receive an email at{" "}
                  <span className="text-[#1ED760]">{email}</span> when it&apos;s done. You can safely close this tab 😉
                </p>
              )}

              {isLoading && (
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
                    Progress: {progress}%
                    <span className="inline-block ml-1 animate-pulse">...</span>
                  </p>
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
        </div>
      </motion.div>
    </div>
  );
}
