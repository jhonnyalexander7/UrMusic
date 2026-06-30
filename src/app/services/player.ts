import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SpotifyAuthService } from './spotify-auth';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  private deviceId: string = '';
  private player: any = null;
  private progressInterval: any = null;

  isPlaying$ = new BehaviorSubject<boolean>(false);
  currentTrack$ = new BehaviorSubject<any>(null);
  progress$ = new BehaviorSubject<number>(0);
  position$ = new BehaviorSubject<number>(0);
  duration$ = new BehaviorSubject<number>(0);

  constructor(private spotifyAuth: SpotifyAuthService) {}

  initPlayer() {
    const token = this.spotifyAuth.getToken();
    if (!token) return;

    (window as any).onSpotifyWebPlaybackSDKReady = () => {
      this.player = new (window as any).Spotify.Player({
        name: 'UrMusic Player',
        getOAuthToken: (cb: any) => cb(token),
        volume: 0.7
      });

      this.player.addListener('ready', ({ device_id }: any) => {
        console.log('Player listo, device_id:', device_id);
        this.deviceId = device_id;
      });

      this.player.addListener('player_state_changed', (state: any) => {
        if (!state) return;
        const isPlaying = !state.paused;
        this.isPlaying$.next(isPlaying);
        this.currentTrack$.next(state.track_window.current_track);
        this.position$.next(state.position);
        this.duration$.next(state.duration);
        this.progress$.next((state.position / state.duration) * 100);

        if (isPlaying) {
          this.startProgressTimer(state.position, state.duration);
        } else {
          this.stopProgressTimer();
        }
      });

      this.player.connect();
    };

    if (!(window as any).Spotify) {
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      document.body.appendChild(script);
    }
  }

  private startProgressTimer(position: number, duration: number) {
    this.stopProgressTimer();
    let current = position;

    this.progressInterval = setInterval(() => {
      current += 1000;
      if (current >= duration) {
        current = duration;
        this.stopProgressTimer();
      }
      this.position$.next(current);
      this.progress$.next((current / duration) * 100);
    }, 1000);
  }

  private stopProgressTimer() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  async playTrack(spotifyUri: string) {
    const token = this.spotifyAuth.getToken();
    if (!token || !this.deviceId) return;

    // Pausar inmediatamente antes de cambiar
    if (this.player) {
      await this.player.pause();
    }

    // Pequeña espera para limpiar el buffer
    await new Promise(resolve => setTimeout(resolve, 300));

    await axios.put(
      `https://api.spotify.com/v1/me/player/play?device_id=${this.deviceId}`,
      { uris: [spotifyUri] },
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
  }

  togglePlay() {
    if (this.player) this.player.togglePlay();
  }

  next() {
    if (this.player) this.player.nextTrack();
  }

  previous() {
    if (this.player) this.player.previousTrack();
  }

  setVolume(volume: number) {
    if (this.player) this.player.setVolume(volume / 100);
  }

  async seek(positionMs: number) {
    if (this.player) this.player.seek(positionMs);
  }

  disconnect() {
    this.stopProgressTimer();
    if (this.player) this.player.disconnect();
  }
}