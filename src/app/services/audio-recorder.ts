import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AudioRecorderService {

  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private syncedInstrumental: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;

  isRecording$ = new BehaviorSubject<boolean>(false);
  recordingTime$ = new BehaviorSubject<number>(0);
  recordedAudio$ = new BehaviorSubject<any>(null);

  private timerInterval: any = null;

  // Grabación simple (sin sincronía)
  async startRecording(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.setupRecorder(this.stream);
      this.mediaRecorder!.start();
      this.isRecording$.next(true);
      this.startTimer();
    } catch (error) {
      console.error('Error al acceder al micrófono:', error);
      throw error;
    }
  }

  // Grabación sincronizada MEZCLANDO voz + instrumental en un solo audio
  async startSyncedRecording(instrumentalUrl: string, startTime: number, endTime: number): Promise<void> {
    try {
      // 1. Obtener el micrófono
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // 2. Crear AudioContext para mezclar
      this.audioContext = new AudioContext();
      const destination = this.audioContext.createMediaStreamDestination();

      // 3. Conectar el micrófono al destino de mezcla
      const micSource = this.audioContext.createMediaStreamSource(this.stream);
      micSource.connect(destination);

      // 4. Cargar el instrumental y conectarlo también al destino de mezcla
      this.syncedInstrumental = new Audio(instrumentalUrl);
      this.syncedInstrumental.currentTime = startTime;
      this.syncedInstrumental.crossOrigin = 'anonymous';

      const instrumentalSource = this.audioContext.createMediaElementSource(this.syncedInstrumental);
      instrumentalSource.connect(destination);
      instrumentalSource.connect(this.audioContext.destination); // para que el usuario también lo escuche mientras graba

      // 5. Grabar el stream MEZCLADO (voz + instrumental)
      this.setupRecorder(destination.stream);
      this.mediaRecorder!.start();
      this.isRecording$.next(true);
      this.startTimer();

      await this.syncedInstrumental.play();

      // 6. Detener automáticamente al llegar al endTime
      const checkTime = setInterval(() => {
        if (this.syncedInstrumental && this.syncedInstrumental.currentTime >= endTime) {
          clearInterval(checkTime);
          this.stopRecording();
        }
      }, 100);

    } catch (error) {
      console.error('Error en grabación sincronizada:', error);
      throw error;
    }
  }

  private setupRecorder(stream: MediaStream) {
    this.mediaRecorder = new MediaRecorder(stream);
    this.audioChunks = [];

    this.mediaRecorder.ondataavailable = (event) => {
      this.audioChunks.push(event.data);
    };

    this.mediaRecorder.onstop = () => {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      const audioUrl = URL.createObjectURL(audioBlob);
      this.recordedAudio$.next({
        blob: audioBlob,
        url: audioUrl,
        name: `Mezcla_${new Date().toLocaleTimeString()}.webm`,
        duration: this.recordingTime$.value
      });
    };
  }

  stopRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      this.stream?.getTracks().forEach(track => track.stop());
      this.isRecording$.next(false);
      this.stopTimer();
    }
    if (this.syncedInstrumental) {
      this.syncedInstrumental.pause();
      this.syncedInstrumental = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  private startTimer() {
    this.recordingTime$.next(0);
    this.timerInterval = setInterval(() => {
      this.recordingTime$.next(this.recordingTime$.value + 1);
    }, 1000);
  }

  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  clearRecording() {
    this.recordedAudio$.next(null);
  }
}