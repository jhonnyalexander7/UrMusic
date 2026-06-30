import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  chevronDown, shareOutline, pauseCircle, mic,
  musicalNotes, radio, apps, download
} from 'ionicons/icons';

@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.page.html',
  styleUrls: ['./analysis.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule]
})
export class AnalysisPage implements OnInit {

  track: any = {
    name: 'Hawái',
    artist: 'Maluma',
    image: ''
  };

  // Barras del visualizador de BPM
  bpmBars: number[] = [14, 28, 42, 20, 35, 48, 18, 38, 52, 24,
                        40, 16, 44, 30, 50, 22, 36, 48, 26, 42,
                        18, 34, 50, 28, 44, 16, 38, 52, 20, 40];

  constructor(private router: Router) {
    addIcons({
      chevronDown, shareOutline, pauseCircle, mic,
      musicalNotes, radio, apps, download
    });
  }

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.track = navigation.extras.state['track'];
    }
  }

  goBack() {
    this.router.navigate(['/player'], {
      state: { track: this.track }
    });
  }
}
