import { Component } from '@angular/core';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { search, mic } from 'ionicons/icons';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [IonContent, IonIcon],
})
export class Tab2Page {
  constructor() {
    addIcons({ search, mic });
  }
}
