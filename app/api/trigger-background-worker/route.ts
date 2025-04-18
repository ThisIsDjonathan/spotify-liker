import { NextResponse } from "next/server";
import { getSpotifyApi } from "@/lib/spotifyAuth";
import { SpotifyService } from "@/lib/spotifyService";
import { QueueService } from "@/lib/queueService";
import { buildUserMessage } from "@/lib/utils";
import { UserMessageType } from "@/types/UserMessageType";

export async function POST() {
  try {
    const spotifyApi = await getSpotifyApi();

    if (!spotifyApi || !spotifyApi?.accessToken) {
      console.error(
        "Unauthorized: Missing or invalid Spotify API credentials."
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!spotifyApi?.email || !spotifyApi?.accessToken) {
      console.error(
        "Invalid Spotify API credentials: Missing email or access token."
      );
      return NextResponse.json(
        { error: "Invalid Spotify API credentials" },
        { status: 400 }
      );
    }

    const spotifyService = new SpotifyService(spotifyApi?.accessToken);

    let playlistsData;
    try {
      playlistsData = await spotifyService.getUserPlaylists();
    } catch (error) {
      console.error("Failed to fetch user playlists:", error);
      return NextResponse.json(
        { error: "Failed to fetch user playlists" },
        { status: 500 }
      );
    }

    let username;
    try {
      username = await spotifyService.getUserName();
    } catch (error) {
      console.error("Failed to fetch user name:", error);
      return NextResponse.json(
        { error: "Failed to fetch user name" },
        { status: 500 }
      );
    }

    let queueService;
    try {
      queueService = new QueueService();
    } catch (error) {
      console.error("Failed to initialize queue service:", error);
      return NextResponse.json(
        { error: "Failed to initialize queue service" },
        { status: 500 }
      );
    }

    let isUserLocked;
    try {
      isUserLocked = await queueService.isUserLocked(spotifyApi.email);
    } catch (error) {
      console.error("Failed to check if user is locked:", error);
      return NextResponse.json(
        { error: "Failed to check user lock status" },
        { status: 500 }
      );
    }

    if (isUserLocked) {
      const response = {
        userMessage: buildUserMessage(UserMessageType.USER_LOCKED, {
          playlistCount: playlistsData.body.total,
        }),
      };
      return NextResponse.json(response, { status: 429 });
    }

    try {
      await queueService.enqueueJob(
        spotifyApi.email,
        username,
        spotifyApi.accessToken
      );
    } catch (error) {
      console.error("Failed to enqueue job:", error);
      return NextResponse.json(
        { error: "Failed to enqueue job" },
        { status: 500 }
      );
    }

    const response = {
      userMessage: buildUserMessage(UserMessageType.ADDED_TO_QUEUE, {
        playlistCount: playlistsData.body.total,
      }),
      playlistCount: playlistsData.body.total,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in POST handler:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
