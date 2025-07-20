import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const API_URL = `${environment.apiBaseUrl}/users`;

@Injectable({
  providedIn: 'root'
})

export class UserAdminService {
  private apiUrl = API_URL; 
  constructor(private http: HttpClient) {}

  getUsers(search?: string, role?: string, verify?: string, active?: string, page: number = 1, limit: number = 10): Observable<any> {
    let url = `${this.apiUrl}?page=${page}&limit=${limit}`;
  
    if (search) url += `&q=${encodeURIComponent(search)}`;
    if (role) url += `&role=${role}`;
    if (verify !== null && verify !== undefined) url += `&isEmailVerified=${verify}`;
    if (active !== null && active !== undefined) url += `&isActive=${active}`;
  
    return this.http.get(url);
  }
  

  getUserById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  getUsersWithSearch(query: string, page: number = 1, limit: number = 10): Observable<any> {
    const url = `${this.apiUrl}/?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`;
   
    return this.http.get(url);
  }

  //  Update any user (admin only)
  updateUser(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, data);
  }

  updateOwnProfile(data: any): Observable<any> {
  return this.http.patch(`${this.apiUrl}/profile/${this.getUserIdFromToken()}`, data);
}
  
  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

    //  Helper: extract user ID from localStorage token
 private getUserIdFromToken(): string | null {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;

  try {
    const user = JSON.parse(userStr);
    const token = user?.token;
    if (!token) return null;

    const payload = JSON.parse(atob(token.split('.')[1]));
    const id = payload.userId || payload._id || null;

    return id;
  } catch (err) {
    return null;
  }
}

  
}

