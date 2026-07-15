import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ListeningHistoryService {

  private HISTORY_KEY = 'urmusic_listening_history';
  private MAX_HISTORY = 50;

  history$ = new BehaviorSubject<any[]>([]);

  constructor() {
    this.loadHistory();
  }

  private loadHistory() {
    const stored = localStorage.getItem(this.HISTORY_KEY);
    const history = stored ? JSON.parse(stored) : [];
    this.history$.next(history);
  }

  private saveHistory(history: any[]) {
    localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
    this.history$.next(history);
  }

  // Registra que el usuario escuchó una canción
  registerPlay(track: any) {
    if (!track || !track.name) return;

    let history = this.history$.value;

    // Eliminar si ya existía para ponerla al inicio (más reciente)
    history = history.filter(h => h.uri !== track.uri && h.name !== track.name);

    // Agregar al inicio con timestamp
    history.unshift({ ...track, playedAt: new Date().toISOString() });

    // Mantener solo las últimas 50
    if (history.length > this.MAX_HISTORY) {
      history = history.slice(0, this.MAX_HISTORY);
    }

    this.saveHistory(history);
  }

  // Obtiene las canciones más recientes (para sección "Recientes")
  getRecentTracks(limit: number = 3): any[] {
    return this.history$.value.slice(0, limit);
  }

  // Obtiene la canción más escuchada (para el featured card)
  getMostPlayedTrack(): any | null {
    const history = this.history$.value;
    if (history.length === 0) return null;

    // Contar frecuencia por nombre de canción
    const counts = new Map<string, { track: any, count: number }>();
    history.forEach(track => {
      const key = track.name + track.artist;
      if (counts.has(key)) {
        counts.get(key)!.count++;
      } else {
        counts.set(key, { track, count: 1 });
      }
    });

    // Encontrar la más escuchada
    let maxEntry = Array.from(counts.values())[0];
    counts.forEach(entry => {
      if (entry.count > maxEntry.count) maxEntry = entry;
    });

    return maxEntry.track;
  }

  // Obtiene los artistas más escuchados por el usuario (nombres únicos, ordenados por frecuencia)
  getTopArtists(limit: number = 5): string[] {
    const history = this.history$.value;
    const counts = new Map<string, number>();

    history.forEach(track => {
      if (track.artist) {
        counts.set(track.artist, (counts.get(track.artist) || 0) + 1);
      }
    });

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([artist]) => artist);
  }

  hasHistory(): boolean {
    return this.history$.value.length > 0;
  }
}