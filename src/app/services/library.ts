import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class LibraryService {

  private STORAGE_KEY = 'urmusic_library';
  private FOLLOWED_ARTISTS_KEY = 'urmusic_followed_artists';

  savedTracks$ = new BehaviorSubject<any[]>([]);
  followedArtists$ = new BehaviorSubject<any[]>([]);

  // Instancia interna de Ionic Storage (se crea de forma asíncrona)
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  // Crea el storage (usa IndexedDB en navegador, SQLite/nativo en dispositivo)
  // y carga los datos guardados previamente
  private async init() {
    this._storage = await this.storage.create();
    await this.loadFromStorage();
    await this.loadFollowedArtists();
  }

  private async loadFromStorage() {
    const tracks = (await this._storage?.get(this.STORAGE_KEY)) || [];
    this.savedTracks$.next(tracks);
  }

  // Actualiza la memoria de inmediato (para lecturas síncronas como isSaved())
  // y persiste en segundo plano sin bloquear la UI
  private saveToStorage(tracks: any[]) {
    this.savedTracks$.next(tracks);
    this._storage?.set(this.STORAGE_KEY, tracks);
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

  private async loadFollowedArtists() {
    const artists = (await this._storage?.get(this.FOLLOWED_ARTISTS_KEY)) || [];
    this.followedArtists$.next(artists);
  }

  private saveFollowedArtists(artists: any[]) {
    this.followedArtists$.next(artists);
    this._storage?.set(this.FOLLOWED_ARTISTS_KEY, artists);
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