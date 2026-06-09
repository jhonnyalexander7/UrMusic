import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { play, cloudOfflineOutline } from 'ionicons/icons';
import { NetworkBannerComponent } from '../components/network-banner/network-banner.component';
import { NetworkService } from '../services/network';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [IonContent, IonButton, IonIcon, CommonModule, NetworkBannerComponent],
})
export class Tab1Page implements OnInit, OnDestroy {

  isOnline: boolean = true;
  private subscription!: Subscription;

  constructor(private networkService: NetworkService) {
    addIcons({ play, cloudOfflineOutline });
  }

  ngOnInit() {
    this.subscription = this.networkService.networkStatus$.subscribe(status => {
      this.isOnline = status;
      if (!status) {
        // Guardar datos localmente cuando está offline
        this.networkService.saveOfflineData('last_screen', { screen: 'tab1', timestamp: new Date() });
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }
}