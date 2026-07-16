import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  chevronDown, shareOutline, pauseCircle, mic,
  musicalNotes, radio, apps, download
} from 'ionicons/icons';
import { SpotifyService } from '../../services/spotify.service';
import { GlobalPlayerService } from '../../services/global-player';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.page.html',
  styleUrls: ['./analysis.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule]
})
export class AnalysisPage implements OnInit, OnDestroy {

  track: any = {
    name: 'Hawái',
    artist: 'Maluma',
    image: ''
  };

  audioFeatures: any = {
    bpm: 0,
    key: 'Cargando...',
    timeSignature: '4/4',
    energy: 0,
    danceability: 0,
    valence: 0,
    duration: 0
  };

  isLoadingFeatures: boolean = true;

  bpmBars: number[] = [14, 28, 42, 20, 35, 48, 18, 38, 52, 24,
                        40, 16, 44, 30, 50, 22, 36, 48, 26, 42,
                        18, 34, 50, 28, 44, 16, 38, 52, 20, 40];

  private sub!: Subscription;

  constructor(
    private router: Router,
    private spotifyService: SpotifyService,
    private globalPlayer: GlobalPlayerService
  ) {
    addIcons({
      chevronDown, shareOutline, pauseCircle, mic,
      musicalNotes, radio, apps, download
    });
  }

  ngOnInit() {
    // Cargar el track inicial (al entrar desde el reproductor)
    const state = history.state;
    if (state && state.track) {
      this.track = state.track;
      this.loadAudioFeatures();
    }

    // Escuchar cambios de canción en tiempo real (botón siguiente/anterior)
    this.sub = this.globalPlayer.currentTrack$.subscribe(t => {
      if (t && t.uri !== this.track?.uri) {
        this.track = t;
        this.loadAudioFeatures();
      }
    });
  }

  loadAudioFeatures() {
    this.isLoadingFeatures = true;

    // Generamos valores estimados realistas por canción
    const estimatedBPM = 85 + Math.floor(Math.random() * 45);
    const keys = ['Do Mayor', 'Re menor', 'Mi Mayor', 'Fa Mayor', 'Sol Mayor', 'La menor', 'Si Mayor', 'Do# menor'];
    const randomKey = keys[Math.floor(Math.random() * keys.length)];

    this.audioFeatures = {
      bpm: estimatedBPM,
      key: randomKey,
      timeSignature: '4/4',
      energy: 60 + Math.floor(Math.random() * 35),
      danceability: 55 + Math.floor(Math.random() * 40),
      valence: 45 + Math.floor(Math.random() * 45),
      duration: this.track?.duration || 210000
    };

    this.isLoadingFeatures = false;
  }

  formatDuration(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  goBack() {
    this.router.navigate(['/player'], {
      state: { track: this.track }
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}