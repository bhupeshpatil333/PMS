import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, retry, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BaseApiService {

  private readonly API_URL = 'https://localhost:5103/api';

  constructor(private http: HttpClient) { }

  get<T>(url: string, params?: any): Observable<T> {
    return this.http.get<T>(`${this.API_URL}/${url}`, { params })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  post<T>(url: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.API_URL}/${url}`, body)
      .pipe(
        catchError(this.handleError)
      );
  }

  put<T>(url: string, body?: any): Observable<T> {
    return this.http.put<T>(`${this.API_URL}/${url}`, body)
      .pipe(
        catchError(this.handleError)
      );
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(`${this.API_URL}/${url}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    return throwError(() => error);
  }
}
