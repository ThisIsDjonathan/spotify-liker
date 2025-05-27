import SpotifyWebApi from "spotify-web-api-node";
import { LikeAllResult } from "@/types/LikeAllResult";

if (!process.env.MAX_PLAYLISTS || !process.env.MAX_TRACKS_PER_PLAYLIST) {
  throw new Error(
    "Environment variables MAX_PLAYLISTS and MAX_TRACKS_PER_PLAYLIST are required.",
  );
}

const MAX_PLAYLISTS = parseInt(process.env.MAX_PLAYLISTS!);
const MAX_TRACKS_PER_PLAYLIST = parseInt(process.env.MAX_TRACKS_PER_PLAYLIST!);
const SPOTIFY_BATCH_SIZE = 50; // Spotify API allows batch size of 50

class SpotifyService {
  private spotifyApi: SpotifyWebApi;

  constructor(accessToken: string, spotifyApiInstance?: SpotifyWebApi) {
    this.spotifyApi = spotifyApiInstance || new SpotifyWebApi();
    this.spotifyApi.setAccessToken(accessToken);
  }

  async getUserPlaylists() {
    const playlists = await this.spotifyApi.getUserPlaylists();

    if (
      !playlists ||
      !playlists.body ||
      !playlists.body.items ||
      playlists.body.items.length === 0
    ) {
      return null;
    }

    return playlists;
  }

  async getUserName(): Promise<string> {
    const me = await this.spotifyApi.getMe();
    return me.body.display_name || me.body.email;
  }

  async likeAll(email: string): Promise<LikeAllResult> {
    const playlists = await this.spotifyApi.getUserPlaylists();

    if (!playlists) {
      console.log(`No playlists found for user ${email}.`);
      return {
        playlistCount: 0,
        songsCount: 0,
      };
    }

    console.log(
      `Found ${playlists.body.items.length} playlists for user ${email}.`,
    );

    let playlistCount = 0;
    let songsCount = 0;

    for (const playlist of playlists.body.items) {
      if (playlistCount >= MAX_PLAYLISTS) {
        console.log(`Reached playlist limit of ${MAX_PLAYLISTS}.`);
        break;
      }
      try {
        songsCount += await this.processPlaylist(playlist);
      } catch (error) {
        console.error(`Error processing playlist ${playlist.name}`, error);
        continue;
      }
      playlistCount++;
    }

    console.log(
      `Finished processing ${playlistCount} playlists and ${songsCount} tracks for user ${email}.`,
    );

    return {
      playlistCount,
      songsCount,
    };
  }

  private async processPlaylist(
    playlist: SpotifyApi.PlaylistObjectSimplified,
  ): Promise<number> {
    console.log(`Processing playlist: ${playlist.name}`);

    const tracks = await this.spotifyApi.getPlaylistTracks(playlist.id);
    let trackCount = 0;
    const trackIds: string[] = [];

    for (const track of tracks.body.items) {
      if (trackCount >= MAX_TRACKS_PER_PLAYLIST) {
        console.log(
          `Reached track limit of ${MAX_TRACKS_PER_PLAYLIST} for playlist: ${playlist.name}.`,
        );
        break;
      }

      if (!track.track || track.track.type !== "track" || !track.track.id) {
        continue;
      }

      trackIds.push(track.track.id);
      trackCount++;

      if (trackIds.length === SPOTIFY_BATCH_SIZE) {
        try {
          await this.saveTracksInBatch(trackIds);
        } catch (error) {
          console.error(
            `Error saving ${trackIds.length} tracks for playlist ${playlist.name}`,
            error,
          );
        }
        trackIds.length = 0;
      }
    }

    if (trackIds.length > 0) {
      try {
        await this.saveTracksInBatch(trackIds);
      } catch (error) {
        console.error(
          `Error saving remaining ${trackIds.length} tracks for playlist ${playlist.name}`,
          error,
        );
      }
    }

    console.log(
      `Processed ${trackCount} tracks from playlist: ${playlist.name}.`,
    );

    return trackCount;
  }

  private async saveTracksInBatch(trackIds: string[], retries = 3) {
    try {
      await this.spotifyApi.addToMySavedTracks(trackIds);
      console.log(`Saved ${trackIds.length} tracks to the user's library.`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.statusCode === 429 && retries > 0) {
        const retryAfter = error.headers["retry-after"];
        console.warn(`Rate limit hit. Retrying after ${retryAfter} seconds...`);
        await new Promise((resolve) =>
          setTimeout(resolve, parseInt(retryAfter, 10) * 1000),
        );
        await this.saveTracksInBatch(trackIds, retries - 1);
      } else {
        console.error(`Failed to save tracks: ${trackIds.join(", ")}`, error);
        throw error;
      }
    }
  }
}

export { SpotifyService };
