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
  if (this.token) return this.token;
  const credentials = btoa(`${this.clientId}:${this.clientSecret}`);
  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      { headers: { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    this.token = response.data.access_token;
    return this.token;
  } catch (error: any) {
    console.error('Error obteniendo token:', error.response?.data || error.message);
    throw error;
  }
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

  async getArtistById(id: string): Promise<any> {
    const token = await this.getToken();
    const response = await axios.get(
      `https://api.spotify.com/v1/artists/${id}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    const artist = response.data;
    return {
      id: artist.id,
      name: artist.name,
      image: artist.images[0]?.url || '',
      followers: artist.followers?.total || 0,
      genres: artist.genres || []
    };
  }

  async getArtistTopTracks(artistId: string, artistName: string): Promise<any[]> {
  const token = await this.getToken();
  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=track&limit=50`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    return response.data.tracks.items.map((track: any) => ({
      name: track.name,
      artist: track.artists[0]?.name || '',
      image: track.album.images[0]?.url || '',
      uri: track.uri,
      duration: track.duration_ms,
      album: track.album.name
    }));
  } catch (error: any) {
    console.error('Detalle del error 400:', error.response?.data);
    throw error;
  }
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
      preview_url: track.preview_url
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
        preview_url: track.preview_url
      })),
      artists: response.data.artists.items.map((artist: any) => ({
        id: artist.id,
        name: artist.name,
        image: artist.images[0]?.url || '',
        genres: artist.genres || []
      }))
    };
  }
}