import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { play, cloudOfflineOutline, chevronForward, locationSharp } from 'ionicons/icons';
import { NetworkBannerComponent } from '../components/network-banner/network-banner.component';
import { NetworkService } from '../services/network';
import { SpotifyService } from '../services/spotify.service';
import { LibraryService } from '../services/library';
import { ListeningHistoryService } from '../services/listening-history';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [IonContent, IonButton, IonIcon, CommonModule, NetworkBannerComponent],
})
export class Tab1Page implements OnInit, OnDestroy {

  isOnline: boolean = true;
  private subscription!: Subscription;

  artists: any[] = [];
  tracks: any[] = [];
  featuredTrack: any = null;

  constructor(
    private networkService: NetworkService,
    private spotifyService: SpotifyService,
    private libraryService: LibraryService,
    private listeningHistory: ListeningHistoryService,
    private router: Router
  ) {
    addIcons({ play, cloudOfflineOutline, chevronForward, locationSharp });
  }

  async ngOnInit() {
    this.subscription = this.networkService.networkStatus$.subscribe(status => {
      this.isOnline = status;
      if (!status) {
        this.networkService.saveOfflineData('last_screen', { screen: 'tab1', timestamp: new Date() });
      }
    });

    await this.loadFeaturedTrack();
    await this.loadRecentTracks();
    await this.loadPersonalizedArtists();
  }

  async loadFeaturedTrack() {
    try {
      const mostPlayed = this.listeningHistory.getMostPlayedTrack();
      if (mostPlayed) {
        this.featuredTrack = mostPlayed;
      } else {
        this.featuredTrack = await this.spotifyService.getTrack('Un Verano Sin Ti', 'Bad Bunny');
      }
    } catch (error) {
      console.error('Error cargando canción destacada:', error);
    }
  }

  async loadRecentTracks() {
    try {
      const recent = this.listeningHistory.getRecentTracks(3);
      if (recent.length > 0) {
        this.tracks = recent;
      } else {
        this.tracks = await this.spotifyService.getTracks([
          { name: 'Hawái', artist: 'Maluma' },
          { name: 'Propuesta Indecente', artist: 'Romeo Santos' },
          { name: 'Tití Me Preguntó', artist: 'Bad Bunny' }
        ]);
      }
    } catch (error) {
      console.error('Error cargando canciones recientes:', error);
    }
  }

  async loadPersonalizedArtists() {
    try {
      const topArtists = this.listeningHistory.getTopArtists(3);
      if (topArtists.length > 0) {
        this.artists = await this.spotifyService.getArtists(topArtists);
      } else {
        this.artists = await this.spotifyService.getArtists([
          'Bad Bunny', 'Drake', 'Romeo Santos'
        ]);
      }
    } catch (error) {
      console.error('Error cargando artistas:', error);
    }
  }

  isFollowing(artist: any): boolean {
    return this.libraryService.isFollowing(artist);
  }

  toggleFollow(artist: any, event: Event) {
    event.stopPropagation();
    this.libraryService.toggleFollow(artist);
  }

  openPlayer(track?: any) {
    const selectedTrack = track || this.featuredTrack;
    this.router.navigate(['/player'], {
      state: { track: selectedTrack }
    });
  }

  openArtist(artist: any) {
    this.router.navigate(['/artist'], {
      state: { artist }
    });
  }

  goToConcerts() {
    this.router.navigate(['/concerts']);
  }

  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }
}