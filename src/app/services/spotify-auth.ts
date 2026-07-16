import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SpotifyAuthService {

  private clientId = '2ca98f1966ad456f8386ecf05d3cabfd';
  private redirectUri = 'http://127.0.0.1:8100/callback';

  // Generar code verifier para PKCE
  private generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  // Generar code challenge desde verifier
  private async generateCodeChallenge(verifier: string): Promise<string> {
    const data = new TextEncoder().encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  async login() {
    const verifier = this.generateCodeVerifier();
    const challenge = await this.generateCodeChallenge(verifier);
    localStorage.setItem('code_verifier', verifier);

    const scopes = 'streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state';

    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: scopes,
      code_challenge_method: 'S256',
      code_challenge: challenge
    });

    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  async handleCallback(code: string): Promise<void> {
    const verifier = localStorage.getItem('code_verifier') || '';
    console.log('Verifier:', verifier);
    console.log('Code:', code);

    const body = new URLSearchParams();
    body.append('client_id', this.clientId);
    body.append('grant_type', 'authorization_code');
    body.append('code', code);
    body.append('redirect_uri', this.redirectUri);
    body.append('code_verifier', verifier);

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString()
    });

    const data = await response.json();
    console.log('Token response:', data);

    if (data.access_token) {
      localStorage.setItem('spotify_token', data.access_token);
      console.log('Token guardado correctamente');
    } else {
      console.error('Error obteniendo token:', data);
    }
  }

  getToken(): string {
    return localStorage.getItem('spotify_token') || '';
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem('spotify_token');
    localStorage.removeItem('code_verifier');
  }
}