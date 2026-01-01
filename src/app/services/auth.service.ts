import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseApiService } from '../core/services/base-api.service';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  constructor(private api: BaseApiService) { }

  login(data: any): Observable<any> {
    return this.api.post<any>('auth/login', data)
      .pipe(
        tap(res => {
          localStorage.setItem('accessToken', res.accessToken);
          localStorage.setItem('refreshToken', res.refreshToken);
          localStorage.setItem('role', res.role);
          this.userSubject.next(res);
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

}
