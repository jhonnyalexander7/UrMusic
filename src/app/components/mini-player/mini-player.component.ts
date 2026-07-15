import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { pause, play, playSkipForward } from 'ionicons/icons';
import { GlobalPlayerService } from '../../services/global-player';
import { PlayerService } from '../../services/player';
import { SpotifyAuthService } from '../../services/spotify-auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-mini-player',
  templateUrl: './mini-player.component.html',
  styleUrls: ['./mini-player.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon]
})
export class MiniPlayerComponent implements OnInit, OnDestroy {

  track: any = null;
  isPlaying: boolean = false;
  private subs: Subscription[] = [];

  constructor(
    private globalPlayer: GlobalPlayerService,
    private playerService: PlayerService,
    private spotifyAuth: SpotifyAuthService,
    private router: Router
  ) {
    addIcons({ pause, play, playSkipForward });
  }

  ngOnInit() {
    this.subs.push(
      this.globalPlayer.currentTrack$.subscribe(t => this.track = t),
      this.globalPlayer.isPlaying$.subscribe(p => this.isPlaying = p)
    );
  }

  togglePlay(event: Event) {
    event.stopPropagation();
    this.playerService.togglePlay();
  }

  next(event: Event) {
    event.stopPropagation();
    const nextTrack = this.globalPlayer.getNextTrack();
    if (nextTrack && this.spotifyAuth.isLoggedIn() && nextTrack.uri) {
      this.playerService.playTrack(nextTrack.uri);
    }
  }

  openPlayer() {
    this.router.navigate(['/player'], {
      state: { track: this.track }
    });
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }
}