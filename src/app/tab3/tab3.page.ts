import { Component } from '@angular/core';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { NgFor } from '@angular/common';
import { addIcons } from 'ionicons';
import { pauseCircle, mic, cloudUpload, download } from 'ionicons/icons';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [IonContent, IonIcon, NgFor],
})
export class Tab3Page {
  barsSelected = Array(8).fill(0);
  barsNormal = Array(16).fill(0);

  constructor() {
    addIcons({ pauseCircle, mic, cloudUpload, download });
  }
}