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
      const userMessage = buildUserMessage(UserMessageType.NO_PLAYLISTS, {});
      return NextResponse.json({ userMessage }, { status: 200 });
    }

    const queueService = new QueueService();
    const job = await queueService.enqueueJob(
      spotifyApi.email!,
      username,
      spotifyApi.accessToken
    );

    const responseObj = {
      userMessage: buildUserMessage(UserMessageType.ADDED_TO_QUEUE, {
        playlistCount: playlists.body.total,
      }),
      playlistCount: playlists.body.total,
      jobId: job.id,
    };

    return NextResponse.json(responseObj, { status: 200 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, userMessage: error.message },
        { status: error.statusCode }
      );
    }

    console.error("Unexpected error in POST handler:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

async function getSpotifyApiInstance(): Promise<SpotifyApiType> {
  const spotifyApi = await getSpotifyApi();

  if (!spotifyApi) {
    throw new AppError({
      message: "Unauthorized: Missing or invalid Spotify API credentials.",
      statusCode: 401,
    });
  }

  if (!spotifyApi.email || !spotifyApi.accessToken) {
    throw new AppError({
      message: "Invalid Spotify API credentials",
      statusCode: 400,
    });
  }

  return spotifyApi;
}
