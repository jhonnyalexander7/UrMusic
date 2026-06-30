import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { Router, NavigationEnd } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  chevronDown, ellipsisHorizontal, heartOutline, heart,
  playSkipBack, playSkipForward, play, pause,
  volumeLow, volumeHigh, shareOutline, cut, list, mic, analytics
} from 'ionicons/icons';
import { PlayerService } from '../../services/player';
import { SpotifyAuthService } from '../../services/spotify-auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-player',
  templateUrl: './player.page.html',
  styleUrls: ['./player.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule]
})
export class PlayerPage implements OnInit, OnDestroy {

  track: any = {
    name: 'Hawái',
    artist: 'Maluma',
    image: '',
    uri: ''
  };

  isPlaying: boolean = false;
  progress: number = 0;
  currentTime: string = '0:00';
  duration: string = '0:00';
  durationMs: number = 0;

  private subs: Subscription[] = [];

  constructor(
    private router: Router,
    private playerService: PlayerService,
    private spotifyAuth: SpotifyAuthService,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({
      chevronDown, ellipsisHorizontal, heartOutline, heart,
      playSkipBack, playSkipForward, play, pause,
      volumeLow, volumeHigh, shareOutline, cut, list, mic, analytics
    });
  }

  ngOnInit() {
    // Obtener track del estado
    const state = history.state;
    if (state && state.track) {
      this.track = state.track;
    }

    if (this.spotifyAuth.isLoggedIn()) {
      this.playerService.initPlayer();

      this.subs.push(
        this.playerService.isPlaying$.subscribe(v => {
          this.isPlaying = v;
          this.cdr.detectChanges();
        }),

        this.playerService.progress$.subscribe(v => {
          this.progress = v;
          this.cdr.detectChanges();
        }),

        this.playerService.position$.subscribe(v => {
          this.currentTime = this.formatTime(v);
          this.cdr.detectChanges();
        }),

        this.playerService.duration$.subscribe(v => {
          this.durationMs = v;
          this.duration = this.formatTime(v);
          this.cdr.detectChanges();
        }),

        // Detectar cuando navegamos al player con nueva canción
        this.router.events.subscribe(event => {
          if (event instanceof NavigationEnd && event.url === '/player') {
            const newState = history.state;
            if (newState?.track && newState.track.uri !== this.track?.uri) {
              this.track = newState.track;
              if (this.track?.uri) {
                this.playerService.playTrack(this.track.uri);
              }
              this.cdr.detectChanges();
            }
          }
        })
      );

      if (this.track?.uri) {
  setTimeout(() => this.playerService.playTrack(this.track.uri), 1000);
}
    }
  }

  formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  togglePlay() {
    if (this.spotifyAuth.isLoggedIn()) {
      this.playerService.togglePlay();
    } else {
      this.isPlaying = !this.isPlaying;
    }
  }

  onSeek(event: any) {
    const percentage = event.target.value;
    const positionMs = (percentage / 100) * this.durationMs;
    this.playerService.seek(positionMs);
  }

  previous() {
    if (this.spotifyAuth.isLoggedIn()) this.playerService.previous();
  }

  next() {
    if (this.spotifyAuth.isLoggedIn()) this.playerService.next();
  }

  goBack() {
    this.router.navigate(['/tabs/tab1']);
  }

  goToEditor() {
    this.router.navigate(['/tabs/tab3']);
  }

  goToAnalysis() {
    this.router.navigate(['/analysis'], {
      state: { track: this.track }
    });
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }
}