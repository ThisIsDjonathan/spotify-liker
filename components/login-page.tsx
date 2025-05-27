"use client";

import { useState } from "react";
import { Music, LogIn, Heart, PlayCircle, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      window.location.href = "/api/auth/login";
    } catch (error) {
      console.error("Error logging in:", error);
      setLoading(false);
      window.location.href = "/error";
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-xl card-elegant rounded-xl p-8"
      >
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="mb-6"
          >
            <Music className="h-12 w-12 text-[#1ED760]" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="text-3xl font-light mb-3 text-center tracking-wide"
          >
            DJ Spotify Liker
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="text-center text-gray-300 mb-6 text-lg font-light"
          >
            Turn Your Playlists Into One Super Playlist 🎉 All your songs, all
            in one place — auto-liked & ready to shuffle!
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.7 }}
            className="flex justify-center items-center mb-6 w-full"
          >
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className="bg-[#1ED760]/10 p-3 rounded-full mb-2">
                <LogIn className="h-5 w-5 text-[#1ED760]" />
              </div>
              <p className="text-xs text-gray-400 text-center">
                Connect Spotify
              </p>
            </div>

            {/* Arrow */}
            <div className="mx-2 text-gray-500">
              <ChevronRight className="h-4 w-4" />
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="bg-[#1ED760]/10 p-3 rounded-full mb-2">
                <Heart className="h-5 w-5 text-[#1ED760]" />
              </div>
              <p className="text-xs text-gray-400 text-center">
                We Like Your Songs
              </p>
            </div>

            {/* Arrow */}
            <div className="mx-2 text-gray-500">
              <ChevronRight className="h-4 w-4" />
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className="bg-[#1ED760]/10 p-3 rounded-full mb-2">
                <PlayCircle className="h-5 w-5 text-[#1ED760]" />
              </div>
              <p className="text-xs text-gray-400 text-center">
                Enjoy Liked Songs
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="text-center text-gray-400 mb-8 text-sm space-y-4"
          >
            <p>
              <span className="font-medium text-white">
                Don&#39;t know what to play?
              </span>{" "}
              We&#39;ll save you the trouble.
            </p>
            <p>
              We go through all your playlists and &quot;like&quot; every track
              — turning your
              <span className="text-white font-medium"> Liked Songs </span>
              into one giant collection.
            </p>
            <p>
              Just hit play on Liked Songs in Spotify and enjoy a mix of
              *everything* you love.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.7 }}
            className="w-full"
          >
            <button
              className="spotify-button w-full flex items-center justify-center gap-2 text-sm"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-black"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Connecting...
                </div>
              ) : (
                "Start Now"
              )}
            </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.7 }}
            className="text-xs text-gray-500 mt-6 text-center"
          >
            We only need permission to like songs in your playlists.
            <br />
            Your listening data stays private.
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
