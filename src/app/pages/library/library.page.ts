import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { trash, play, musicalNotesOutline, peopleOutline, closeCircle, playCircle, trashOutline } from 'ionicons/icons';
import { LibraryService } from '../../services/library';
import { GlobalPlayerService } from '../../services/global-player';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-library',
  templateUrl: './library.page.html',
  styleUrls: ['./library.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule]
})
export class LibraryPage implements OnInit, OnDestroy {

  activeTab: 'songs' | 'artists' = 'songs';

  savedTracks: any[] = [];
  followedArtists: any[] = [];

  private subs: Subscription[] = [];

  constructor(
    private libraryService: LibraryService,
    private globalPlayer: GlobalPlayerService,
    private router: Router
  ) {
    addIcons({musicalNotesOutline,peopleOutline,playCircle,trashOutline,closeCircle,trash,play});
  }

  ngOnInit() {
    this.subs.push(
      this.libraryService.savedTracks$.subscribe(tracks => {
        this.savedTracks = tracks;
      }),
      this.libraryService.followedArtists$.subscribe(artists => {
        this.followedArtists = artists;
      })
    );
  }

  openPlayer(track: any) {
    const index = this.savedTracks.findIndex(t => t.uri === track.uri);
    this.globalPlayer.setQueue(this.savedTracks, index >= 0 ? index : 0);
    this.router.navigate(['/player'], {
      state: { track }
    });
  }

  removeTrack(track: any, event: Event) {
    event.stopPropagation();
    this.libraryService.removeTrack(track);
  }

  openArtist(artist: any) {
    this.router.navigate(['/artist'], {
      state: { artist }
    });
  }

  unfollowArtist(artist: any, event: Event) {
    event.stopPropagation();
    this.libraryService.unfollowArtist(artist);
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }
}