import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LibraryService {

  private STORAGE_KEY = 'urmusic_library';
  private FOLLOWED_ARTISTS_KEY = 'urmusic_followed_artists';

  savedTracks$ = new BehaviorSubject<any[]>([]);
  followedArtists$ = new BehaviorSubject<any[]>([]);

  constructor() {
    this.loadFromStorage();
    this.loadFollowedArtists();
  }

  private loadFromStorage() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    const tracks = stored ? JSON.parse(stored) : [];
    this.savedTracks$.next(tracks);
  }

  private saveToStorage(tracks: any[]) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tracks));
    this.savedTracks$.next(tracks);
  }

  isSaved(track: any): boolean {
    const tracks = this.savedTracks$.value;
    return tracks.some(t => t.uri === track.uri || t.name === track.name);
  }

  saveTrack(track: any) {
    const tracks = this.savedTracks$.value;
    if (!this.isSaved(track)) {
      const newTracks = [...tracks, { ...track, savedAt: new Date().toISOString() }];
      this.saveToStorage(newTracks);
    }
  }

  async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  removeTrack(track: any) {
    const tracks = this.savedTracks$.value;
    const filtered = tracks.filter(t => t.uri !== track.uri && t.name !== track.name);
    this.saveToStorage(filtered);
  }

  toggleSave(track: any) {
    if (this.isSaved(track)) {
      this.removeTrack(track);
    } else {
      this.saveTrack(track);
    }
  }

  getSavedTracks(): any[] {
    return this.savedTracks$.value;
  }

  // ── Artistas seguidos ──

  private loadFollowedArtists() {
    const stored = localStorage.getItem(this.FOLLOWED_ARTISTS_KEY);
    const artists = stored ? JSON.parse(stored) : [];
    this.followedArtists$.next(artists);
  }

  private saveFollowedArtists(artists: any[]) {
    localStorage.setItem(this.FOLLOWED_ARTISTS_KEY, JSON.stringify(artists));
    this.followedArtists$.next(artists);
  }

  isFollowing(artist: any): boolean {
    const artists = this.followedArtists$.value;
    return artists.some(a => a.id === artist.id || a.name === artist.name);
  }

  followArtist(artist: any) {
    const artists = this.followedArtists$.value;
    if (!this.isFollowing(artist)) {
      const newArtists = [...artists, artist];
      this.saveFollowedArtists(newArtists);
    }
  }

  unfollowArtist(artist: any) {
    const artists = this.followedArtists$.value;
    const filtered = artists.filter(a => a.id !== artist.id && a.name !== artist.name);
    this.saveFollowedArtists(filtered);
  }

  toggleFollow(artist: any) {
    if (this.isFollowing(artist)) {
      this.unfollowArtist(artist);
    } else {
      this.followArtist(artist);
    }
  }
}