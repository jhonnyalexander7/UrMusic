import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { Router, NavigationEnd } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  chevronDown, ellipsisHorizontal, heartOutline, heart,
  playSkipBack, playSkipForward, play, pause,
  volumeLow, volumeHigh, shareOutline, cut, list, mic, analytics,
  downloadOutline, checkmarkCircle, bluetooth
} from 'ionicons/icons';
import { PlayerService } from '../../services/player';
import { SpotifyAuthService } from '../../services/spotify-auth';
import { GlobalPlayerService } from '../../services/global-player';
import { LibraryService } from '../../services/library';
import { ListeningHistoryService } from '../../services/listening-history';
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
  isSaved: boolean = false;

  private subs: Subscription[] = [];

  constructor(
    private router: Router,
    private playerService: PlayerService,
    private spotifyAuth: SpotifyAuthService,
    private globalPlayer: GlobalPlayerService,
    private libraryService: LibraryService,
    private listeningHistory: ListeningHistoryService,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({
      chevronDown, ellipsisHorizontal, heartOutline, heart,
      playSkipBack, playSkipForward, play, pause,
      volumeLow, volumeHigh, shareOutline, cut, list, mic, analytics,
      downloadOutline, checkmarkCircle, bluetooth
    });
  }

  ngOnInit() {
    const state = history.state;
    if (state && state.track) {
      this.track = state.track;
    }

    this.globalPlayer.setCurrentTrack(this.track);
    this.checkIfSaved();
    this.registerCurrentTrack();

    this.subs.push(
      this.globalPlayer.currentTrack$.subscribe(t => {
        if (t && t.uri !== this.track?.uri) {
          this.track = t;
          this.checkIfSaved();
          this.registerCurrentTrack();
          if (this.spotifyAuth.isLoggedIn() && t.uri) {
            this.playerService.playTrack(t.uri);
          }
          this.cdr.detectChanges();
        }
      })
    );

    if (this.spotifyAuth.isLoggedIn()) {
      this.playerService.initPlayer();

      this.subs.push(
        this.playerService.isPlaying$.subscribe(v => {
          this.isPlaying = v;
          this.globalPlayer.setPlaying(v);
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

        this.router.events.subscribe(event => {
          if (event instanceof NavigationEnd && event.url === '/player') {
            const newState = history.state;
            if (newState?.track && newState.track.uri !== this.track?.uri) {
              this.track = newState.track;
              this.checkIfSaved();
              this.registerCurrentTrack();
              this.globalPlayer.setCurrentTrack(this.track);
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

  registerCurrentTrack() {
    this.listeningHistory.registerPlay(this.track);
  }

  checkIfSaved() {
    this.isSaved = this.libraryService.isSaved(this.track);
  }

  toggleDownload() {
    this.libraryService.toggleSave(this.track);
    this.checkIfSaved();
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
    const prevTrack = this.globalPlayer.getPreviousTrack();
    if (prevTrack) {
      this.track = prevTrack;
      this.checkIfSaved();
      if (this.spotifyAuth.isLoggedIn() && prevTrack.uri) {
        this.playerService.playTrack(prevTrack.uri);
      }
    }
  }

  next() {
    const nextTrack = this.globalPlayer.getNextTrack();
    if (nextTrack) {
      this.track = nextTrack;
      this.checkIfSaved();
      if (this.spotifyAuth.isLoggedIn() && nextTrack.uri) {
        this.playerService.playTrack(nextTrack.uri);
      }
    }
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

  goToBluetooth() {
    this.router.navigate(['/bluetooth-devices']);
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }
}