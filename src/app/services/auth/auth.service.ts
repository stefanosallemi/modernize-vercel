import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private router: Router, private http: HttpClient) { }

  login(uname: string, password: string): Observable<any> {
    const loginData = { uname, password };
    return this.http.post(`${this.apiUrl}/login`, loginData).pipe(
      map((response: any) => {
        // Salva il token di autenticazione ottenuto dal backend
        const token = response.token;
        this.saveAuthToken(token); // Salva il token nel local storage
        return response;
      }),
      catchError((error) => {
        console.error('Login failed:', error);
        return of(error);
      })
    );
  }

  logout(): void {
    // Rimuovi il token di autenticazione salvato
    this.removeAuthToken(); // Rimuovi il token dal local storage
    this.router.navigate(['/authentication/login']);
  }

  isLoggedIn(): boolean {
    // Controlla se l'utente è loggato verificando la presenza del token di autenticazione
    return !!this.getAuthToken();
  }

  private saveAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private removeAuthToken(): void {
    localStorage.removeItem('authToken');
  }
}
