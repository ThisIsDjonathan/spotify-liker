/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserMessageType } from "@/types/UserMessageType"

export function buildUserMessage(
  messageType: UserMessageType,
  data: any
): string {
  switch (messageType) {
    case UserMessageType.USER_LOCKED:
      return `⏳ Whoa there, champ! We're still jammin' through your last request. Give us a sec before hitting it again 🎧🔥`;
    case UserMessageType.ADDED_TO_QUEUE:
      return `🎶 Alright! We're diving into your ${data.playlistCount} playlists like it's a Spotify buffet 🍽️. Hang tight, the magic is happening! ✨`;
    case UserMessageType.ALREADY_PROCESSED:
      return `✅ Been there, liked that! Your playlists are already full of ❤️. Come back later for another round!`;
    case UserMessageType.NO_PLAYLISTS:
      return `🤔 Hmmm... looks like you don't have any playlists. Create some and come back later 🎵💥`;
    case UserMessageType.ERROR:
      return `💥 Yikes! Something went sideways while processing your playlists. Even robots have bad days 🤖💔`;
    default:
      return "";
  }
}

export function buildEmailMessage(
  userName: string,
  playlistCount: number,
  songsCount: number
): string {
  return `Hey ${userName},\n\nWe just wanted to let you know that we've successfully liked all the songs in your ${playlistCount} playlists, totaling ${songsCount} songs. 🎉\n\nThanks for using our service!\n\nBest,\nThe Team`;
}

export function buildEmailSubject(): string {
  return `Your playlists have been processed! 🎉`;
}