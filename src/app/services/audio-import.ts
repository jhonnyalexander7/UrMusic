import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AudioImportService {

  importedAudio$ = new BehaviorSubject<any>(null);

  // Valida y procesa el archivo de audio importado
  importFile(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const validTypes = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/aiff', 'audio/x-aiff', 'audio/mp3'];
      const validExtensions = ['.mp3', '.wav', '.aiff'];

      const fileName = file.name.toLowerCase();
      const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));

      if (!hasValidExtension) {
        reject('Formato no soportado. Usa MP3, WAV o AIFF.');
        return;
      }

      const audioUrl = URL.createObjectURL(file);
      const audio = new Audio(audioUrl);

      audio.addEventListener('loadedmetadata', () => {
        const result = {
          file,
          url: audioUrl,
          name: file.name,
          duration: audio.duration,
          size: file.size
        };
        this.importedAudio$.next(result);
        resolve(result);
      });

      audio.addEventListener('error', () => {
        reject('No se pudo leer el archivo de audio.');
      });
    });
  }

  formatFileSize(bytes: number): string {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  }

  clearImport() {
    this.importedAudio$.next(null);
  }
}