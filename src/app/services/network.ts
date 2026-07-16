import { Injectable } from '@angular/core';
import { Network } from '@capacitor/network';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  // Observable que emite true si hay conexión, false si no
  private isOnline$ = new BehaviorSubject<boolean>(true);
  public networkStatus$ = this.isOnline$.asObservable();

  // Lista de datos pendientes por sincronizar
  private pendingData: any[] = [];

  constructor() {
    this.initNetworkListener();
    this.checkInitialStatus();
  }

  // Verifica el estado inicial de la red al arrancar la app
  private async checkInitialStatus() {
    const status = await Network.getStatus();
    console.log('Estado inicial de red:', status.connected);
    this.isOnline$.next(status.connected);
  }

  // Escucha cambios en tiempo real de la red
  private initNetworkListener() {
    Network.addListener('networkStatusChange', status => {
      console.log('Cambio de red detectado:', status.connected);
      this.isOnline$.next(status.connected);

      // Si se recupera la conexión, sincroniza datos pendientes
      if (status.connected) {
        this.syncPendingData();
      }
    });
  }

  // Retorna el estado actual de la red
  async getCurrentStatus(): Promise<boolean> {
    const status = await Network.getStatus();
    return status.connected;
  }

  // Guarda datos localmente cuando está offline
  saveOfflineData(key: string, data: any) {
    const entry = { key, data, timestamp: new Date().toISOString() };
    this.pendingData.push(entry);
    localStorage.setItem('pending_data', JSON.stringify(this.pendingData));
    console.log('Dato guardado offline:', entry);
  }

  // Sincroniza datos pendientes cuando vuelve la conexión
  private syncPendingData() {
    const stored = localStorage.getItem('pending_data');
    if (stored) {
      this.pendingData = JSON.parse(stored);
      console.log('Sincronizando', this.pendingData.length, 'elementos pendientes...');
      // Aquí iría la lógica para enviar al servidor
      localStorage.removeItem('pending_data');
      this.pendingData = [];
      console.log('Sincronización completada');
    }
  }
}