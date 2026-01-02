import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseApiService } from '../core/services/base-api.service';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from '../models/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private api: BaseApiService) {
    const userStr = localStorage.getItem('user');
    if (this.isLoggedIn() && userStr) {
      this.userSubject.next(JSON.parse(userStr));
    }
  }

  login(data: any): Observable<any> {
    return this.api.post<any>('auth/login', data)
      .pipe(
        tap(res => {
          localStorage.setItem('accessToken', res.accessToken);
          localStorage.setItem('refreshToken', res.refreshToken);
          localStorage.setItem('user', JSON.stringify(res.user));
          this.userSubject.next(res.user);
        })
      );
  }

  logout() {
    localStorage.clear();
    this.userSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  refreshToken(): Observable<any> {
    return this.api.post('auth/refresh', {
      refreshToken: localStorage.getItem('refreshToken')
    }).pipe(
      tap(res => localStorage.setItem('accessToken', (res as any).accessToken))
    );
  }

  saveSession(res: any) {
    localStorage.setItem('accessToken', res.accessToken);
    localStorage.setItem('role', res.role);
  }

  register(data: any): Observable<any> {
    return this.api.post('auth/register', data);
  }

  getAllUsers(): Observable<User[]> {
    return this.api.get<User[]>('users');
  }
  getAllEmpUsers(): Observable<User[]> {
    return this.api.get<User[]>('users/employees');
  }

  getAllManagers(): Observable<User[]> {
    return this.api.get<User[]>('users/managers');
  }

}
