import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import {
  pauseCircle, playCircleOutline, mic, cloudUpload, download, stop, playCircle, trash, musicalNotes, checkmarkCircle
} from 'ionicons/icons';
import { AudioRecorderService } from '../services/audio-recorder';
import { AudioImportService } from '../services/audio-import';
import { LibraryService } from '../services/library';
import { GlobalPlayerService } from '../services/global-player';
import { AudioEffectsService } from '../services/audio-effects';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [IonContent, IonIcon, NgFor, NgIf, FormsModule],
})
export class Tab3Page implements OnInit, OnDestroy {

  waveformHeights: number[] = [
    30, 55, 80, 45, 70, 35, 90, 50,
    60, 25, 75, 40, 85, 55, 30, 65,
    45, 80, 35, 70, 50, 90, 40, 60,
    35, 65, 50, 80, 40, 70, 55, 45
  ];

  isPlayingPreview: boolean = false;
  private animationInterval: any = null;

  currentTrack: any = null;
  isGlobalPlaying: boolean = false;

  isRecording: boolean = false;
  isSyncedRecording: boolean = false;
  recordingTimeDisplay: string = '0:00';
  recordedAudio: any = null;
  importedAudio: any = null;
  savedSuccess: boolean = false;

  startTime: number = 20;
  endTime: number = 60;

  // Valores de los efectos
  bassValue: number = 50;
  trebleValue: number = 50;
  reverbValue: number = 0;

  // Audio de prueba para escuchar los efectos en vivo
  private testAudio: HTMLAudioElement | null = null;

  private previewAudio: HTMLAudioElement | null = null;
  private subs: Subscription[] = [];

  constructor(
    private audioRecorder: AudioRecorderService,
    private audioImport: AudioImportService,
    private libraryService: LibraryService,
    private globalPlayer: GlobalPlayerService,
    private audioEffects: AudioEffectsService
  ) {
    addIcons({ pauseCircle, playCircleOutline, mic, cloudUpload, download, stop, playCircle, trash, musicalNotes, checkmarkCircle });
  }

  ngOnInit() {
    this.subs.push(
      this.globalPlayer.currentTrack$.subscribe(t => this.currentTrack = t),
      this.globalPlayer.isPlaying$.subscribe(p => this.isGlobalPlaying = p),

      this.audioRecorder.isRecording$.subscribe(v => {
        this.isRecording = v;
        this.isPlayingPreview = v;
        if (v) this.startWaveformAnimation();
        else this.stopWaveformAnimation();
      }),
      this.audioRecorder.recordingTime$.subscribe(v => {
        this.recordingTimeDisplay = this.audioRecorder.formatTime(v);
      }),
      this.audioRecorder.recordedAudio$.subscribe(v => this.recordedAudio = v),
      this.audioImport.importedAudio$.subscribe(v => this.importedAudio = v)
    );
  }

  // Conecta el audio de prueba a la cadena de efectos (usa el importado o el grabado)
  private ensureAudioConnected(url: string) {
    if (!this.testAudio || this.testAudio.src !== url) {
      this.testAudio = new Audio(url);
      this.testAudio.crossOrigin = 'anonymous';
      this.audioEffects.connectAudio(this.testAudio);
    }
    this.audioEffects.resume();
  }

  onBassChange() {
    const url = this.importedAudio?.url || this.recordedAudio?.url;
    if (url) this.ensureAudioConnected(url);
    this.audioEffects.setBass(this.bassValue);
  }

  onTrebleChange() {
    const url = this.importedAudio?.url || this.recordedAudio?.url;
    if (url) this.ensureAudioConnected(url);
    this.audioEffects.setTreble(this.trebleValue);
  }

  onReverbChange() {
    const url = this.importedAudio?.url || this.recordedAudio?.url;
    if (url) this.ensureAudioConnected(url);
    this.audioEffects.setReverb(this.reverbValue);
  }

  // Reproduce el audio con los efectos aplicados
  playWithEffects() {
    const url = this.importedAudio?.url || this.recordedAudio?.url;
    if (!url) {
      alert('Primero graba o importa un audio para aplicar efectos.');
      return;
    }
    this.ensureAudioConnected(url);
    this.testAudio?.play();
    this.isPlayingPreview = true;
    this.startWaveformAnimation();

    if (this.testAudio) {
      this.testAudio.onended = () => {
        this.isPlayingPreview = false;
        this.stopWaveformAnimation();
      };
    }
  }

  private startWaveformAnimation() {
    this.animationInterval = setInterval(() => {
      this.waveformHeights = this.waveformHeights.map(() =>
        Math.floor(Math.random() * 70) + 20
      );
    }, 150);
  }

  private stopWaveformAnimation() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
    }
  }

  async startRecording() {
    try {
      this.isSyncedRecording = false;
      await this.audioRecorder.startRecording();
    } catch (error) {
      alert('No se pudo acceder al micrófono. Verifica los permisos del navegador.');
    }
  }

  async startSyncedRecording() {
    if (!this.importedAudio) return;
    try {
      this.isSyncedRecording = true;
      await this.audioRecorder.startSyncedRecording(
        this.importedAudio.url,
        this.startTime,
        this.endTime
      );
    } catch (error) {
      alert('No se pudo acceder al micrófono. Verifica los permisos del navegador.');
    }
  }

  stopRecording() {
    this.audioRecorder.stopRecording();
  }

  clearRecording() {
    this.audioRecorder.clearRecording();
    this.savedSuccess = false;
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      await this.audioImport.importFile(file);
    } catch (error) {
      alert(error);
    }
  }

  clearImport() {
    this.audioImport.clearImport();
  }

  playPreview(url: string) {
    if (this.previewAudio) {
      this.previewAudio.pause();
    }
    this.previewAudio = new Audio(url);
    this.previewAudio.play();

    this.isPlayingPreview = true;
    this.startWaveformAnimation();

    this.previewAudio.onended = () => {
      this.isPlayingPreview = false;
      this.stopWaveformAnimation();
    };
  }

  async saveMyVersion() {
    if (!this.recordedAudio) {
      alert('Primero graba tu voz antes de guardar.');
      return;
    }

    const base64Audio = await this.libraryService.blobToBase64(this.recordedAudio.blob);

    const myVersion = {
      name: this.recordedAudio.name,
      artist: 'Mi versión',
      image: '',
      uri: '',
      localUrl: base64Audio,
      isLocalRecording: true,
      duration: this.recordedAudio.duration
    };

    this.libraryService.saveTrack(myVersion);
    this.savedSuccess = true;

    setTimeout(() => {
      this.savedSuccess = false;
    }, 2000);
  }

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  formatFileSize(bytes: number): string {
    return this.audioImport.formatFileSize(bytes);
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
    this.stopWaveformAnimation();
    this.audioEffects.disconnect();
  }
}