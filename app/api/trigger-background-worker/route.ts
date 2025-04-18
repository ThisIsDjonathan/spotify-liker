import { NextResponse } from "next/server";
import { getSpotifyApi } from "@/lib/spotifyAuth";
import { SpotifyService } from "@/lib/spotifyService";
import { QueueService } from "@/lib/queueService";
import { buildUserMessage } from "@/lib/utils";
import { UserMessageType } from "@/types/UserMessageType";

export async function POST() {
  try {
    console.log(`POST request received at /api/trigger-background-worker`);
    console.log("Fetching Spotify API credentials...");
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

    let spotifyService;
    try {
      console.log("Initializing SpotifyService...");
      spotifyService = new SpotifyService(spotifyApi?.accessToken);
      console.log("SpotifyService initialized successfully.");
    } catch (error) {
      console.error("Failed to initialize SpotifyService:", error);
      return NextResponse.json(
        { error: "Failed to initialize SpotifyService" },
        { status: 500 }
      );
    }

    let playlistsData;
    try {
      console.log("Fetching user playlists...");
      playlistsData = await spotifyService.getUserPlaylists();
      console.log("User playlists fetched successfully.");
    } catch (error) {
      console.error("Failed to fetch user playlists:", error);
      return NextResponse.json(
        { error: "Failed to fetch user playlists" },
        { status: 500 }
      );
    }

    if (!playlistsData || !playlistsData.body || !playlistsData.body.items || playlistsData.body.items.length === 0) {
      const userMsg = buildUserMessage(
        UserMessageType.NO_PLAYLISTS,
        {}
      );
      console.error("Invalid response from Spotify API:", playlistsData);
      return NextResponse.json(
        { userMsg },
        { status: 200 }
      );
    }

    let username;
    try {
      console.log("Fetching user name...");
      username = await spotifyService.getUserName();
      console.log("User name fetched successfully.");
    } catch (error) {
      console.error("Failed to fetch user name:", error);
      return NextResponse.json(
        { error: "Failed to fetch user name" },
        { status: 500 }
      );
    }

    let queueService;
    try {
      console.log("Initializing QueueService...");
      queueService = new QueueService();
      console.log("QueueService initialized successfully.");
    } catch (error) {
      console.error("Failed to initialize queue service:", error);
      return NextResponse.json(
        { error: "Failed to initialize queue service" },
        { status: 500 }
      );
    }

    let isUserLocked;
    try {
      console.log("Checking if user is locked...");
      isUserLocked = await queueService.isUserLocked(spotifyApi.email);
      console.log(`User lock status checked successfully. Locked: ${isUserLocked}`);
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
      console.log("Enqueuing job...");
      await queueService.enqueueJob(
        spotifyApi.email,
        username,
        spotifyApi.accessToken
      );
      console.log("Job enqueued successfully.");
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
