import Link from "next/link";
import { Music } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full py-4 px-6">
      <div className="max-w-md mx-auto">
        <div className="flex flex-col items-center justify-center text-center space-y-2 text-gray-400">
          <div className="flex items-center gap-2">
            <Music className="h-4 w-4 text-[#1ED760]" />
            <span className="text-sm font-light">
              Mixing code & beats since 2014
            </span>
          </div>
          <div className="text-xs">
            Created by{" "}
            <Link
              href="https://www.djonathan.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1ED760] hover:underline transition-all"
            >
              Djonathan Krause, DJ
            </Link>
          </div>
          <div className="text-[10px] opacity-70">www.djonathan.com</div>
        </div>
      </div>
    </footer>
  );
}
