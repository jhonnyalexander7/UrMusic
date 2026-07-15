import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  // Obtiene la ubicación actual del usuario
  async getCurrentPosition(): Promise<{ lat: number; lng: number }> {
    try {
      const permission = await Geolocation.requestPermissions();

      if (permission.location !== 'granted') {
        throw new Error('Permiso de ubicación denegado');
      }

      const position = await Geolocation.getCurrentPosition();
      return {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      // Ubicación por defecto: Santo Domingo, RD
      return { lat: 18.4861, lng: -69.9312 };
    }
  }

  // Genera conciertos simulados cerca de la ubicación del usuario
  generateNearbyConcerts(userLat: number, userLng: number) {
    const concerts = [
      { name: 'Bad Bunny — World Hottest Tour', venue: 'Estadio Olímpico', artist: 'Bad Bunny', date: '15 Ago 2026', offsetLat: 0.01, offsetLng: 0.015 },
      { name: 'Romeo Santos — Fórmula Vol. 3', venue: 'Palacio de los Deportes', artist: 'Romeo Santos', date: '22 Ago 2026', offsetLat: -0.008, offsetLng: 0.02 },
      { name: 'Maluma — Papi Juancho Tour', venue: 'Autódromo Las Américas', artist: 'Maluma', date: '05 Sep 2026', offsetLat: 0.015, offsetLng: -0.01 },
      { name: 'Drake — Big As The What? Tour', venue: 'Coliseo Roberto Clemente', artist: 'Drake', date: '18 Sep 2026', offsetLat: -0.012, offsetLng: -0.018 },
    ];

    return concerts.map(c => ({
      ...c,
      lat: userLat + c.offsetLat,
      lng: userLng + c.offsetLng
    }));
  }
}