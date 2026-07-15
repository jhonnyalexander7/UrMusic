import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { chevronDown, ellipsisVertical, checkmark } from 'ionicons/icons';
import { SpotifyService } from '../../services/spotify.service';
import { GlobalPlayerService } from '../../services/global-player';
import { LibraryService } from '../../services/library';

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
  albums: any[] = [];
  selectedAlbumTracks: any[] = [];
  selectedAlbum: any = null;
  showAlbumTracks: boolean = false;
  isFollowing: boolean = false;

  constructor(
    private router: Router,
    private spotifyService: SpotifyService,
    private globalPlayer: GlobalPlayerService,
    private libraryService: LibraryService
  ) {
    addIcons({ chevronDown, ellipsisVertical, checkmark });
  }

  async ngOnInit() {
    const state = history.state;
    if (state && state.artist) {
      this.artist = state.artist;
      this.isFollowing = this.libraryService.isFollowing(this.artist);
      await this.loadTracks();
      await this.loadAlbums();
    }
  }

  toggleFollow() {
    this.libraryService.toggleFollow(this.artist);
    this.isFollowing = this.libraryService.isFollowing(this.artist);
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

  async loadAlbums() {
    try {
      this.albums = await this.spotifyService.getArtistAlbums(
        this.artist.id,
        this.artist.name
      );
    } catch (error) {
      console.error('Error cargando álbumes:', error);
    }
  }

  async openAlbum(album: any) {
    try {
      this.selectedAlbum = album;
      this.selectedAlbumTracks = await this.spotifyService.getAlbumTracks(album.id);
      this.showAlbumTracks = true;
    } catch (error) {
      console.error('Error cargando tracks del álbum:', error);
    }
  }

  closeAlbum() {
    this.showAlbumTracks = false;
    this.selectedAlbum = null;
    this.selectedAlbumTracks = [];
  }

  formatDuration(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  openPlayer(track: any) {
    const index = this.tracks.findIndex(t => t.uri === track.uri);
    this.globalPlayer.setQueue(this.tracks, index >= 0 ? index : 0);
    this.router.navigate(['/player'], {
      state: { track }
    });
  }

  openPlayerFromAlbum(track: any) {
    const index = this.selectedAlbumTracks.findIndex(t => t.uri === track.uri);
    this.globalPlayer.setQueue(this.selectedAlbumTracks, index >= 0 ? index : 0);
    this.router.navigate(['/player'], {
      state: { track }
    });
  }

  goBack() {
    if (this.showAlbumTracks) {
      this.closeAlbum();
    } else {
      this.router.navigate(['/tabs/tab1']);
    }
  }
}