import { Component } from '@angular/core';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { musicalNotes, logoApple } from 'ionicons/icons';
import { SpotifyAuthService } from '../../services/spotify-auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon]
})
export class LoginPage {

  constructor(
    private router: Router,
    private spotifyAuth: SpotifyAuthService
  ) {
    addIcons({ musicalNotes, logoApple });
  }

  loginSpotify() {
    this.spotifyAuth.login();
  }

  continueAsGuest() {
    this.router.navigate(['/tabs/tab1']);
  }
}