import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { chevronDown, bluetooth, headset, checkmarkCircle, refresh } from 'ionicons/icons';
import { BluetoothService } from '../../services/bluetooth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bluetooth-devices',
  templateUrl: './bluetooth-devices.page.html',
  styleUrls: ['./bluetooth-devices.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule]
})
export class BluetoothDevicesPage implements OnInit, OnDestroy {

  devices: any[] = [];
  isScanning: boolean = false;
  connectedDevice: any = null;
  errorMessage: string = '';

  private subs: Subscription[] = [];

  constructor(
    private router: Router,
    private bluetoothService: BluetoothService
  ) {
    addIcons({ chevronDown, bluetooth, headset, checkmarkCircle, refresh });
  }

  ngOnInit() {
    this.subs.push(
      this.bluetoothService.devices$.subscribe(d => this.devices = d),
      this.bluetoothService.isScanning$.subscribe(s => this.isScanning = s),
      this.bluetoothService.connectedDevice$.subscribe(d => this.connectedDevice = d)
    );

    this.startScan();
  }

  async startScan() {
    this.errorMessage = '';
    try {
      await this.bluetoothService.scanForDevices();
    } catch (error) {
      this.errorMessage = 'No se pudo acceder al Bluetooth. Verifica que esté activado y que el navegador tenga permisos.';
    }
  }

  async connectTo(device: any) {
    try {
      await this.bluetoothService.connectDevice(device.deviceId, device.name);
    } catch (error) {
      this.errorMessage = 'No se pudo conectar al dispositivo.';
    }
  }

  async disconnect() {
    await this.bluetoothService.disconnectDevice();
  }

  goBack() {
    this.bluetoothService.stopScan();
    this.router.navigate(['/tabs/tab1']);
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
    this.bluetoothService.stopScan();
  }
}
