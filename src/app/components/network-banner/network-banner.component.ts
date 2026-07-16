import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { wifiOutline, cloudOfflineOutline } from 'ionicons/icons';
import { NetworkService } from '../../services/network';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-network-banner',
  templateUrl: './network-banner.component.html',
  styleUrls: ['./network-banner.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon]
})
export class NetworkBannerComponent implements OnInit, OnDestroy {

  isOnline: boolean = true;
  private subscription!: Subscription;

  constructor(private networkService: NetworkService) {
    addIcons({ wifiOutline, cloudOfflineOutline });
  }

  ngOnInit() {
    // Suscribirse a los cambios de red
    this.subscription = this.networkService.networkStatus$.subscribe(status => {
      this.isOnline = status;
    });
  }

  ngOnDestroy() {
    // Cancelar suscripción al destruir el componente
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
