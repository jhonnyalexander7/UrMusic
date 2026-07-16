import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {

  private clientId = '2ca98f1966ad456f8386ecf05d3cabfd';
  private clientSecret = '1bb604020935459dbecc2b6d3a31e6c0';
  private token: string = '';

  async getToken(): Promise<string> {
    const credentials = btoa(`${this.clientId}:${this.clientSecret}`);
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      { headers: { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    this.token = response.data.access_token;
    return this.token;
  }

  async getArtist(name: string): Promise<any> {
    const token = await this.getToken();
    const response = await axios.get(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(name)}&type=artist&limit=1`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    const artist = response.data.artists.items[0];
    return {
      id: artist.id,
      name: artist.name,
      image: artist.images[0]?.url || '',
      followers: artist.followers?.total || 0,
      genres: artist.genres || []
    };
  }

  async getArtists(names: string[]): Promise<any[]> {
    return Promise.all(names.map(name => this.getArtist(name)));
  }

  async getArtistTopTracks(artistId: string, artistName: string): Promise<any[]> {
    const token = await this.getToken();
    const response = await axios.get(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=track&limit=10`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    return response.data.tracks.items
      .filter((track: any) =>
        track.artists.some((a: any) =>
          a.name.toLowerCase() === artistName.toLowerCase()
        )
      )
      .map((track: any) => ({
        name: track.name,
        artist: track.artists[0]?.name || '',
        image: track.album.images[0]?.url || '',
        uri: track.uri,
        duration: track.duration_ms,
        album: track.album.name,
        trackId: track.id
      }));
  }

  async getArtistAlbums(artistId: string, artistName: string): Promise<any[]> {
    const token = await this.getToken();

    // Hacemos 2 búsquedas con términos ligeramente distintos para cubrir más álbumes
    const [response1, response2] = await Promise.all([
      axios.get(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=track&limit=10`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      ),
      axios.get(
        `https://api.spotify.com/v1/search?q=artist:${encodeURIComponent(artistName)}&type=track&limit=10&offset=10`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
    ]);

    const allTracks = [
      ...response1.data.tracks.items,
      ...response2.data.tracks.items
    ];

    const albumsMap = new Map();
    allTracks
      .filter((track: any) =>
        track.artists.some((a: any) =>
          a.name.toLowerCase() === artistName.toLowerCase()
        )
      )
      .forEach((track: any) => {
        const album = track.album;
        if (!albumsMap.has(album.id)) {
          albumsMap.set(album.id, {
            id: album.id,
            name: album.name,
            image: album.images[0]?.url || '',
            year: album.release_date?.substring(0, 4) || '',
            totalTracks: album.total_tracks
          });
        }
      });

    return Array.from(albumsMap.values());
  }
  async getAlbumTracks(albumId: string): Promise<any[]> {
    const token = await this.getToken();
    const albumResponse = await axios.get(
      `https://api.spotify.com/v1/albums/${albumId}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    const album = albumResponse.data;
    return album.tracks.items.map((track: any) => ({
      name: track.name,
      artist: track.artists[0]?.name || '',
      image: album.images[0]?.url || '',
      uri: track.uri,
      duration: track.duration_ms,
      album: album.name,
      trackId: track.id
    }));
  }

  async getTrack(name: string, artist: string): Promise<any> {
    const token = await this.getToken();
    const response = await axios.get(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(name + ' ' + artist)}&type=track&limit=1`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    const track = response.data.tracks.items[0];
    return {
      name: track.name,
      artist: track.artists[0]?.name || artist,
      image: track.album.images[0]?.url || '',
      uri: track.uri,
      preview_url: track.preview_url,
      trackId: track.id
    };
  }

  async getTracks(tracks: {name: string, artist: string}[]): Promise<any[]> {
    return Promise.all(tracks.map(t => this.getTrack(t.name, t.artist)));
  }

  async search(query: string): Promise<any> {
    const token = await this.getToken();
    const response = await axios.get(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track,artist&limit=5`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    return {
      tracks: response.data.tracks.items.map((track: any) => ({
        name: track.name,
        artist: track.artists[0]?.name || '',
        image: track.album.images[0]?.url || '',
        uri: track.uri,
        preview_url: track.preview_url,
        trackId: track.id
      })),
      artists: response.data.artists.items.map((artist: any) => ({
        id: artist.id,
        name: artist.name,
        image: artist.images[0]?.url || '',
        genres: artist.genres || []
      }))
    };
  }

  async getAudioFeatures(trackId: string): Promise<any> {
    const token = await this.getToken();
    const response = await axios.get(
      `https://api.spotify.com/v1/audio-features/${trackId}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    const data = response.data;

    const keys = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];
    const keyName = data.key >= 0 ? keys[data.key] : 'Desconocida';
    const mode = data.mode === 1 ? 'Mayor' : 'menor';

    return {
      bpm: Math.round(data.tempo),
      key: `${keyName} ${mode}`,
      timeSignature: `${data.time_signature}/4`,
      energy: Math.round(data.energy * 100),
      danceability: Math.round(data.danceability * 100),
      valence: Math.round(data.valence * 100),
      acousticness: Math.round(data.acousticness * 100),
      duration: data.duration_ms
    };
  }
}