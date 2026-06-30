import { Component } from '@angular/core';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { search, mic, play, chevronForward } from 'ionicons/icons';
import { SpotifyService } from '../services/spotify.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [IonContent, IonIcon, CommonModule, FormsModule],
})
export class Tab2Page {

  searchQuery: string = '';
  searchResults: any = null;
  isSearching: boolean = false;

  constructor(
    private spotifyService: SpotifyService,
    private router: Router
  ) {
    addIcons({ search, mic, play, chevronForward });
  }

  async onSearch() {
    if (!this.searchQuery.trim()) {
      this.searchResults = null;
      return;
    }
    this.isSearching = true;
    try {
      this.searchResults = await this.spotifyService.search(this.searchQuery);
    } catch (error) {
      console.error('Error en búsqueda:', error);
    }
    this.isSearching = false;
  }

  openPlayer(track: any) {
    this.router.navigate(['/player'], {
      state: { track }
    });
  }

  openArtist(artist: any) {
    this.router.navigate(['/artist'], {
      state: { artist }
    });
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchResults = null;
  }
}