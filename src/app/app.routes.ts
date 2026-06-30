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
];