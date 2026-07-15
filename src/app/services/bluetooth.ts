import { Injectable } from '@angular/core';
import { BleClient } from '@capacitor-community/bluetooth-le';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BluetoothService {

  devices$ = new BehaviorSubject<any[]>([]);
  isScanning$ = new BehaviorSubject<boolean>(false);
  connectedDevice$ = new BehaviorSubject<any>(null);

  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;
    try {
      await BleClient.initialize();
      this.isInitialized = true;
    } catch (error) {
      console.error('Error inicializando Bluetooth:', error);
      throw error;
    }
  }

  // Escanea dispositivos Bluetooth cercanos (auriculares, parlantes)
  async scanForDevices(): Promise<void> {
    try {
      await this.initialize();
      this.devices$.next([]);
      this.isScanning$.next(true);

      // En navegador web usamos requestDevice con filtro de nombre vacío para mostrar todos
      const device = await BleClient.requestDevice({
        namePrefix: ''
      });

      const foundDevice = {
        deviceId: device.deviceId,
        name: device.name || 'Dispositivo desconocido',
        rssi: -50
      };

      this.devices$.next([foundDevice]);
      this.isScanning$.next(false);

    } catch (error) {
      console.error('Error escaneando dispositivos:', error);
      this.isScanning$.next(false);
      throw error;
    }
  }

  // Conecta a un dispositivo Bluetooth (auriculares/parlante)
  async connectDevice(deviceId: string, deviceName: string): Promise<void> {
    try {
      await BleClient.connect(deviceId);
      this.connectedDevice$.next({ deviceId, name: deviceName });
    } catch (error) {
      console.error('Error conectando dispositivo:', error);
      throw error;
    }
  }

  async disconnectDevice(): Promise<void> {
    const device = this.connectedDevice$.value;
    if (device) {
      try {
        await BleClient.disconnect(device.deviceId);
        this.connectedDevice$.next(null);
      } catch (error) {
        console.error('Error desconectando:', error);
      }
    }
  }

  stopScan() {
    this.isScanning$.next(false);
  }
}