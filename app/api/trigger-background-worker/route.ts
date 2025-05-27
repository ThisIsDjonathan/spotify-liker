import { NextResponse } from "next/server";
import { getSpotifyApi } from "@/lib/spotifyAuth";
import { SpotifyService } from "@/lib/spotifyService";
import { QueueService } from "@/lib/queueService";
import { buildUserMessage } from "@/lib/utils";
import { UserMessageType } from "@/types/UserMessageType";
import { AppError } from "@/types/AppError";
import { SpotifyApiType } from "@/types/SpotifyApiType";

export async function POST() {
  try {
    const spotifyApi = await getSpotifyApiInstance();
    const spotifyService = new SpotifyService(spotifyApi.accessToken);
    const username = await spotifyService.getUserName();
    const playlists = await spotifyService.getUserPlaylists();

    if (!playlists) {
      const userMsg = buildUserMessage(UserMessageType.NO_PLAYLISTS, {});
      return NextResponse.json({ userMsg }, { status: 200 });
    }

    await enqueueJob(spotifyApi, username);

    const responseObj = {
      userMessage: buildUserMessage(UserMessageType.ADDED_TO_QUEUE, {
        playlistCount: playlists.body.total,
      }),
      playlistCount: playlists.body.total,
    };

    return NextResponse.json(responseObj, { status: 200 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    console.error("Unexpected error in POST handler:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}

async function getSpotifyApiInstance(): Promise<SpotifyApiType> {
  const spotifyApi = await getSpotifyApi();

  if (!spotifyApi) {
    throw new AppError({
      error: "Unauthorized: Missing or invalid Spotify API credentials.",
      statusCode: 401,
    });
  }

  if (!spotifyApi.email || !spotifyApi.accessToken) {
    throw new AppError({
      error: "Invalid Spotify API credentials",
      statusCode: 400,
    });
  }

  return spotifyApi;
}

async function enqueueJob(spotifyApi: SpotifyApiType, username: string) {
  const queueService = new QueueService();
  const isUserLocked = await queueService.isUserLocked(spotifyApi.email!);

  if (isUserLocked) {
    throw new AppError({
      error: "User is locked",
      statusCode: 429,
    });
  }

  await queueService.enqueueJob(
    spotifyApi.email!,
    username,
    spotifyApi.accessToken,
  );
}
