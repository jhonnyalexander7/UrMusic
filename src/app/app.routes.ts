import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'player',
    loadComponent: () => import('./pages/player/player.page').then(m => m.PlayerPage)
  },
  {
    path: 'analysis',
    loadComponent: () => import('./pages/analysis/analysis.page').then(m => m.AnalysisPage)
  },
  {
    path: 'callback',
    loadComponent: () => import('./pages/callback/callback.page').then(m => m.CallbackPage)
  },
  {
    path: 'artist',
    loadComponent: () => import('./pages/artist/artist.page').then(m => m.ArtistPage)
  },
  {
    path: 'library',
    loadComponent: () => import('./pages/library/library.page').then( m => m.LibraryPage)
  },
  {
    path: 'concerts',
    loadComponent: () => import('./pages/concerts/concerts.page').then( m => m.ConcertsPage)
  },

  {
  path: 'concerts',
  loadComponent: () => import('./pages/concerts/concerts.page').then(m => m.ConcertsPage)
},
  {
    path: 'bluetooth-devices',
    loadComponent: () => import('./pages/bluetooth-devices/bluetooth-devices.page').then( m => m.BluetoothDevicesPage)
  },

{
  path: 'bluetooth-devices',
  loadComponent: () => import('./pages/bluetooth-devices/bluetooth-devices.page').then(m => m.BluetoothDevicesPage)
},

];
