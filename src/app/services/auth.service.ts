import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { switchMap, throwError, Observable, of } from 'rxjs';

const API_URL = `${environment.apiBaseUrl}/auth`;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private unverifiedUserData: any = null;
  constructor(private _HttpClient: HttpClient) { }

  refreshAccessToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token'));
    }

    return this._HttpClient.post<{
      success: boolean,
      message: string,
      data: {
        accessToken: string,
        refreshToken: string
      }
    }>(`${API_URL}/refresh-token`, { refreshToken }).pipe(
      switchMap((response) => {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        return of(true);
      })
    );
  }


  login(data: { email: string, password: string }): Observable<any> {
    return this._HttpClient.post(`${API_URL}/login`, data);
  }

  register(data: { name: string, email: string, password: string, role: 'author' | 'user' }): Observable<any> {
    return this._HttpClient.post(`${API_URL}/register`, data);
  }

  verifyEmail(data: { otp: string }): Observable<any> {
    return this._HttpClient.post(`${API_URL}/verify-email`, data);
  }

  resendVerificationOTP(data: { email: string }): Observable<any> {
    return this._HttpClient.post(`${API_URL}/resend-verification-otp`, data);
  }

  requestPasswordReset(data: { email: string }): Observable<any> {
    return this._HttpClient.post(`${API_URL}/request-password-reset`, data);
  }

  resetPassword(data: { otp: string, newPassword: string }): Observable<any> {
    return this._HttpClient.post(`${API_URL}/reset-password`, data);
  }

  googleLogin(token: string, role?: string): Observable<any> {
    const payload: any = { token };
    if (role) {
      payload.role = role;
    }
    return this._HttpClient.post(`${API_URL}/google`, payload);
  }

  setUnverifiedUserData(userData: any): void {
    this.unverifiedUserData = userData;
  }

  getUnverifiedUserData(): any {
    return this.unverifiedUserData;
  }

  clearUnverifiedUserData(): void {
    this.unverifiedUserData = null;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.clearUnverifiedUserData();
  }

  getCurrentUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isAuthor(): boolean {
    return this.getCurrentUser()?.role === 'author';
  }

  isAdmin(): boolean {
    return this.getCurrentUser()?.role === 'admin';
  }
}
