import { Component } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { headset, search, options, library } from 'ionicons/icons';
import { MiniPlayerComponent } from '../components/mini-player/mini-player.component';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, MiniPlayerComponent],
})
export class TabsPage {
  constructor() {
    addIcons({ headset, search, options, library });
  }
}