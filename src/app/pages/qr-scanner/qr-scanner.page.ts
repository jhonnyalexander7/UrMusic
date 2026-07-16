import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { chevronDown, qrCode, scanOutline, checkmarkCircle } from 'ionicons/icons';
import { QrScannerService } from '../../services/qr-scanner';
import { GlobalPlayerService } from '../../services/global-player';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-qr-scanner',
  templateUrl: './qr-scanner.page.html',
  styleUrls: ['./qr-scanner.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule]
})
export class QrScannerPage implements OnInit, AfterViewInit {

  isScanning: boolean = false;
  scannedTrack: any = null;
  errorMessage: string = '';
  track: any = null;
  qrImageUrl: string = '';

  constructor(
    private router: Router,
    private qrScannerService: QrScannerService,
    private globalPlayer: GlobalPlayerService
  ) {
    addIcons({ chevronDown, qrCode, scanOutline, checkmarkCircle });
  }

  ngOnInit() {
    const state = history.state;
    if (state && state.track) {
      this.track = state.track;
    } else {
      this.track = this.globalPlayer.currentTrack$.value;
    }
  }

  async ngAfterViewInit() {
    if (this.track) {
      await this.generateQrImage();
    }
  }

  async generateQrImage() {
    try {
      const data = this.qrScannerService.generateShareData(this.track);
      this.qrImageUrl = await QRCode.toDataURL(data, {
        color: { dark: '#ffffff', light: '#00000000' },
        width: 220,
        margin: 1
      });
    } catch (error) {
      console.error('Error generando QR:', error);
    }
  }

  async startScan() {
    this.errorMessage = '';
    this.isScanning = true;
    try {
      const result = await this.qrScannerService.scanQrCode();
      if (result) {
        const parsedTrack = this.qrScannerService.parseSharedTrack(result);
        if (parsedTrack) {
          this.scannedTrack = parsedTrack;
        } else {
          this.errorMessage = 'El código QR no contiene una canción válida de UrMusic.';
        }
      }
    } catch (error) {
      this.errorMessage = 'No se pudo acceder a la cámara. Verifica los permisos.';
    }
    this.isScanning = false;
  }

  playScannedTrack() {
    if (this.scannedTrack) {
      this.router.navigate(['/player'], {
        state: { track: this.scannedTrack }
      });
    }
  }

  goBack() {
    this.router.navigate(['/player']);
  }
}