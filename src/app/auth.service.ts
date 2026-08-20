import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface AuthResponse {
  message: string;
  token: string;
  user: { id: string; name: string; username: string; email: string };
}

const API_URL = 'http://localhost:5050/api';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(this.getStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  signup(name: string, username: string, email: string, password: string): Observable<any> {
    return this.http.post(`${API_URL}/signup`, { name, username, email, password });
  }

  checkUsernameAvailable(username: string): Observable<boolean> {
    return this.http
      .get<{ available: boolean }>(`${API_URL}/check-username`, { params: { username } })
      .pipe(
        map(res => res.available),
        catchError(() => of(true))
      );
  }

  login(username: string, password: string, rememberMe: boolean = true): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_URL}/login`, { username, password }).pipe(
      tap(res => {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem(TOKEN_KEY, res.token);
        storage.setItem(USER_KEY, JSON.stringify(res.user));
        this.currentUserSubject.next(res.user);
      })
    );
  }

  resetPassword(email: string, newPassword: string): Observable<any> {
    return this.http.post(`${API_URL}/forgot-password`, { email, newPassword });
  }

  logout(): void {
    this.http.post(`${API_URL}/logout`, {}, { headers: this.authHeaders() }).subscribe({
      next: () => this.clearSession(),
      error: () => this.clearSession()
    });
  }

  private clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  }

  private getStoredUser(): any {
    const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private authHeaders() {
    const token = this.getToken();
    return { Authorization: `Bearer ${token}` };
  
  }
} 