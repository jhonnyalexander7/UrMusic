import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { chevronDown, locationSharp, calendar } from 'ionicons/icons';
import { GeolocationService } from '../../services/geolocation';
import * as L from 'leaflet';

@Component({
  selector: 'app-concerts',
  templateUrl: './concerts.page.html',
  styleUrls: ['./concerts.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule]
})
export class ConcertsPage implements OnInit, AfterViewInit {

  concerts: any[] = [];
  userLocation: { lat: number; lng: number } | null = null;
  isLoading: boolean = true;
  private map: any = null;

  constructor(
    private router: Router,
    private geolocationService: GeolocationService
  ) {
    addIcons({ chevronDown, locationSharp, calendar });
  }

  async ngOnInit() {
    this.isLoading = true;
    this.userLocation = await this.geolocationService.getCurrentPosition();
    this.concerts = this.geolocationService.generateNearbyConcerts(
      this.userLocation.lat,
      this.userLocation.lng
    );
    this.isLoading = false;
  }

  ngAfterViewInit() {
    // Esperar a que los datos carguen antes de iniciar el mapa
    const checkReady = setInterval(() => {
      if (this.userLocation && !this.isLoading) {
        clearInterval(checkReady);
        setTimeout(() => this.initMap(), 200);
      }
    }, 100);
  }

  private initMap() {
    if (!this.userLocation) return;

    this.map = L.map('concerts-map').setView(
      [this.userLocation.lat, this.userLocation.lng], 12
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    // Marcador del usuario
    const userIcon = L.divIcon({
      className: 'user-marker',
      html: '<div class="user-dot"></div>',
      iconSize: [16, 16]
    });
    L.marker([this.userLocation.lat, this.userLocation.lng], { icon: userIcon })
      .addTo(this.map)
      .bindPopup('Tú estás aquí');

    // Marcadores de conciertos
    const concertIcon = L.divIcon({
      className: 'concert-marker',
      html: '<div class="concert-pin">🎵</div>',
      iconSize: [32, 32]
    });

    this.concerts.forEach(concert => {
      L.marker([concert.lat, concert.lng], { icon: concertIcon })
        .addTo(this.map)
        .bindPopup(`<b>${concert.artist}</b><br>${concert.venue}<br>${concert.date}`);
    });
  }

  goBack() {
    this.router.navigate(['/tabs/tab1']);
  }
}