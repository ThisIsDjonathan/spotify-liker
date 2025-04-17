/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserMessageType } from "@/types/UserMessageType";

export function buildUserMessage(
  messageType: UserMessageType,
  data: any,
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
  return `
    <div style="font-family: sans-serif; padding: 24px; color: #ffffff; background-color: #0d0d0d;">
      <img
        src="#TODO-ADD-CORRECT-URL/spotify-liker-og.png"
        alt="Spotify Liker by DJ"
        style="width: 100%; max-width: 600px; border-radius: 12px; margin-bottom: 24px;"
      />
      <h2 style="color: #1ED760;">Hey ${userName},</h2>

      <p style="font-size: 16px; line-height: 1.5;">
        We just finished processing your music collection! ✅ <br />
        A total of <strong>${songsCount}</strong> songs across <strong>${playlistCount}</strong> playlists have been added to your <em>Liked Songs</em> on Spotify. 🎉
      </p>

      <p style="font-size: 16px; line-height: 1.5;">
        That's your personalized super-playlist, ready to shuffle and enjoy.
        Click here to check it out: <br />
        🎵 <a href="https://open.spotify.com/collection/tracks" style="color: #1ED760;">Liked Songs</a>
      </p>

      <p style="font-size: 16px; line-height: 1.5;">
        Thanks for using <strong>Spotify Liker by DJ</strong>! Feel free to check out more on our website:
        <br />
        👉 <a href="https://www.djonathan.com" style="color: #1ED760;">djonathan.com</a>
      </p>

      <p style="margin-top: 32px;">Rock on, <br />— DJ</p>
    </div>
  `;
}

export function buildEmailSubject(): string {
  return `Your playlists have been processed! 🎉`;
}
