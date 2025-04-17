import SpotifyWebApi from "spotify-web-api-node";
import { LikeAllResult } from "@/types/LikeAllResult";

const MAX_PLAYLISTS = parseInt(process.env.MAX_PLAYLISTS || "1");
const MAX_TRACKS_PER_PLAYLIST = parseInt(process.env.MAX_TRACKS_PER_PLAYLIST || "1");
const SPOTIFY_BATCH_SIZE = 50; // Spotify API allows batch size of 50

class SpotifyService {
  private spotifyApi: SpotifyWebApi;

  constructor(accessToken: string, spotifyApiInstance?: SpotifyWebApi) {
    this.spotifyApi = spotifyApiInstance || new SpotifyWebApi();
    this.spotifyApi.setAccessToken(accessToken);
  }

  async getUserPlaylists() {
    const playlists = await this.spotifyApi.getUserPlaylists();
    return playlists;
  }

  async getUserName(): Promise<string> {
    const me = await this.spotifyApi.getMe();
    return me.body.display_name || me.body.email;
  }

  async likeAll(email: string): Promise<LikeAllResult> {
    const playlists = await this.spotifyApi.getUserPlaylists();

    console.log(
      `Found ${playlists.body.items.length} playlists for user ${email}.`
    );

    let playlistCount = 0;
    let songsCount = 0;

    for (const playlist of playlists.body.items) {
      if (playlistCount >= MAX_PLAYLISTS) {
        console.log(`Reached playlist limit of ${MAX_PLAYLISTS}.`);
        break;
      }

      playlistCount++;
      console.log(`Processing playlist: ${playlist.name}`);

      const tracks = await this.spotifyApi.getPlaylistTracks(playlist.id);
      let trackCount = 0;
      const trackIds: string[] = [];

      for (const track of tracks.body.items) {
        if (trackCount >= MAX_TRACKS_PER_PLAYLIST) {
          console.log(
            `Reached track limit of ${MAX_TRACKS_PER_PLAYLIST} for playlist: ${playlist.name}.`
          );
          break;
        }

        if (track.track && track.track.type === "track") {
          trackIds.push(track.track.id);
          trackCount++;
          songsCount++;

          if (trackIds.length === SPOTIFY_BATCH_SIZE) {
            await this.saveTracksInBatch(trackIds);
            trackIds.length = 0;
          }
        }
      }

      if (trackIds.length > 0) {
        await this.saveTracksInBatch(trackIds);
      }

      console.log(
        `Processed ${trackCount} tracks from playlist: ${playlist.name}.`
      );
    }

    console.log(
      `Finished processing ${playlistCount} playlists and ${songsCount} tracks for user ${email}.`
    );

    return {
      playlistCount,
      songsCount,
    };
  }

  private async saveTracksInBatch(trackIds: string[]) {
    try {
      await this.spotifyApi.addToMySavedTracks(trackIds);
      console.log(`Saved ${trackIds.length} tracks to the user's library.`);
    } catch (error: any) {
      if (error.statusCode === 429) {
        const retryAfter = error.headers["retry-after"];
        console.warn(`Rate limit hit. Retrying after ${retryAfter} seconds...`);
        await new Promise((resolve) =>
          setTimeout(resolve, parseInt(retryAfter, 10) * 1000)
        );
        await this.saveTracksInBatch(trackIds);
      } else {
        console.error("Failed to save tracks:", error);
      }
    }
  }
}

export { SpotifyService };
