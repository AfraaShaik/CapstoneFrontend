// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({providedIn: 'root'})
export class AuthService {
  private apiUrl = 'http://localhost:8091/auth';

  constructor(private http: HttpClient) {}

  signup(payload: { email: string, password: string, fullName: string }) {
    return this.http.post(`${this.apiUrl}/signup`, payload);
  }

  login(payload: { email: string, password: string }) {
    return this.http.post<{token: string}>(`${this.apiUrl}/login`, payload)
      .pipe(res => res);
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken() {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('token');
    }
    return null;
  }
  
  isLoggedIn() {
    return typeof window !== 'undefined' && !!this.getToken();
  }

  logout() {
    localStorage.removeItem('token');
  }
  getRole(): string {
    // If you decode your JWT, you can extract the role claim
    // For simplicity, assume role is stored in localStorage at 'role'
    // Adjust to your actual JWT decoding logic
    const token = this.getToken();
    if (!token) return '';
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || ''; // ensure your JWT has a 'role' claim
  }
  getUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || null;
  }
  getUsername(): string {
    const token = this.getToken();
    if (!token) return '';
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.username || ''; // if 'sub' is the username claim
  }
  
  
  
  
}
