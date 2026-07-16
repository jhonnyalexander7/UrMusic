import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { SpotifyAuthService } from '../../services/spotify-auth';

@Component({
  selector: 'app-callback',
  templateUrl: './callback.page.html',
  styleUrls: ['./callback.page.scss'],
  standalone: true,
  imports: [IonContent]
})
export class CallbackPage implements OnInit {

  constructor(
    private router: Router,
    private spotifyAuth: SpotifyAuthService
  ) {}

  async ngOnInit() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      await this.spotifyAuth.handleCallback(code);
      this.router.navigate(['/tabs/tab1']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}