import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalPlayerService {

  currentTrack$ = new BehaviorSubject<any>(null);
  isPlaying$ = new BehaviorSubject<boolean>(false);

  private queue: any[] = [];
  private currentIndex: number = 0;

  setCurrentTrack(track: any) {
    this.currentTrack$.next(track);
  }

  setPlaying(isPlaying: boolean) {
    this.isPlaying$.next(isPlaying);
  }

  // Establece la cola completa de canciones (ej: canciones de un artista)
  setQueue(tracks: any[], startIndex: number = 0) {
    this.queue = tracks;
    this.currentIndex = startIndex;
    this.setCurrentTrack(this.queue[this.currentIndex]);
  }

  getNextTrack(): any {
    if (this.queue.length === 0) return null;
    this.currentIndex = (this.currentIndex + 1) % this.queue.length;
    const track = this.queue[this.currentIndex];
    this.setCurrentTrack(track);
    return track;
  }

  getPreviousTrack(): any {
    if (this.queue.length === 0) return null;
    this.currentIndex = (this.currentIndex - 1 + this.queue.length) % this.queue.length;
    const track = this.queue[this.currentIndex];
    this.setCurrentTrack(track);
    return track;
  }

  hasQueue(): boolean {
    return this.queue.length > 0;
  }
}