import { Injectable } from '@angular/core';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';

@Injectable({
  providedIn: 'root'
})
export class QrScannerService {

  // Verifica si el escaneo está soportado en este dispositivo/navegador
  async isSupported(): Promise<boolean> {
    try {
      const result = await BarcodeScanner.isSupported();
      return result.supported;
    } catch (error) {
      return false;
    }
  }

  // Solicita permiso de cámara
  async requestPermissions(): Promise<boolean> {
    try {
      const { camera } = await BarcodeScanner.requestPermissions();
      return camera === 'granted' || camera === 'limited';
    } catch (error) {
      console.error('Error solicitando permisos de cámara:', error);
      return false;
    }
  }

  async scanQrCode(): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Permiso de cámara denegado');
      }

      const { barcodes } = await BarcodeScanner.scan();

      if (barcodes.length > 0) {
        return barcodes[0].rawValue || null;
      }
      return null;
    } catch (error) {
      console.error('Error escaneando QR:', error);
      throw error;
    }
  }

  // Genera datos de una canción en formato para compartir por QR
  generateShareData(track: any): string {
    return JSON.stringify({
      type: 'urmusic-track',
      name: track.name,
      artist: track.artist,
      uri: track.uri,
      image: track.image
    });
  }

  // Interpreta el contenido escaneado de un QR de UrMusic
  parseSharedTrack(qrContent: string): any | null {
    try {
      const data = JSON.parse(qrContent);
      if (data.type === 'urmusic-track') {
        return {
          name: data.name,
          artist: data.artist,
          uri: data.uri,
          image: data.image
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}