import { NextResponse } from "next/server";
import { getSpotifyApi } from "@/lib/spotifyAuth";
import { SpotifyService } from "@/lib/spotifyService";
import { QueueService } from "@/lib/queueService";
import { buildUserMessage } from "@/lib/utils";
import { UserMessageType } from "@/types/UserMessageType";

export async function POST() {
  const spotifyApi = await getSpotifyApi();

  if (!spotifyApi || !spotifyApi?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!spotifyApi?.email || !spotifyApi?.accessToken) {
    return NextResponse.json(
      { error: "Invalid Spotify API credentials" },
      { status: 400 },
    );
  }

  const spotifyService = new SpotifyService(spotifyApi?.accessToken);
  const playlistsData = await spotifyService.getUserPlaylists();
  const username = await spotifyService.getUserName();

  const queueService = new QueueService();
  const isUserLocked = await queueService.isUserLocked(spotifyApi.email);
  if (isUserLocked) {
    const response = {
      userMessage: buildUserMessage(UserMessageType.USER_LOCKED, {
        playlistCount: playlistsData.body.total,
      }),
    };
    return NextResponse.json(response, { status: 429 });
  }

  await queueService.enqueueJob(
    spotifyApi.email,
    username,
    spotifyApi.accessToken,
  );
  const response = {
    userMessage: buildUserMessage(UserMessageType.ADDED_TO_QUEUE, {
      playlistCount: playlistsData.body.total,
    }),
    playlistCount: playlistsData.body.total,
  };
  return NextResponse.json(response, { status: 200 });
}
