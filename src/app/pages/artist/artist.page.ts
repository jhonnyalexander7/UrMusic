import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { chevronDown, ellipsisVertical } from 'ionicons/icons';
import { SpotifyService } from '../../services/spotify.service';

@Component({
  selector: 'app-artist',
  templateUrl: './artist.page.html',
  styleUrls: ['./artist.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule]
})
export class ArtistPage implements OnInit {

  artist: any = null;
  tracks: any[] = [];

  constructor(
    private router: Router,
    private spotifyService: SpotifyService
  ) {
    addIcons({ chevronDown, ellipsisVertical });
  }

  async ngOnInit() {
    const state = history.state;
    if (state && state.artist) {
      this.artist = state.artist;
      await this.loadTracks();
    }
  }

  async loadTracks() {
    try {
      this.tracks = await this.spotifyService.getArtistTopTracks(
        this.artist.id,
        this.artist.name
      );
    } catch (error) {
      console.error('Error cargando canciones:', error);
    }
  }

  formatDuration(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  openPlayer(track: any) {
    this.router.navigate(['/player'], {
      state: { track }
    });
  }

  goBack() {
    this.router.navigate(['/tabs/tab1']);
  }
}