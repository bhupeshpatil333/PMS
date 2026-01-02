import { Injectable } from '@angular/core';
import { BehaviorSubject, tap, shareReplay, Observable, combineLatest, switchMap } from 'rxjs';
import { BaseApiService } from '../core/services/base-api.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private page$ = new BehaviorSubject<number>(1);
  private search$ = new BehaviorSubject<string>('');

  private refresh$ = new BehaviorSubject<void>(undefined);

  constructor(private api: BaseApiService) { }

  projects$ = combineLatest([this.page$, this.search$, this.refresh$]).pipe(
    switchMap(([page, search]) =>
      this.api.get<any>('projects/paged', {
        page,
        pageSize: 5,
        search
      })
    ),
    shareReplay(1)
  );

  refresh() {
    this.refresh$.next();
  }

  setPage(page: number) {
    this.page$.next(page);
  }

  setSearch(text: string) {
    this.search$.next(text);
  }

  createProject(data: any): Observable<any> {
    return this.api.post<any>('projects', data)
      .pipe(
        tap(() => this.page$.next(1))
      );
  }

  getAllProjects(): Observable<any[]> {
    return this.api.get<any[]>('projects');
  }

  getProject(id: number): Observable<any> {
    return this.api.get<any>(`projects/${id}`);
  }

  updateProject(id: number, data: any): Observable<any> {
    return this.api.put<any>(`projects/${id}`, data)
      .pipe(
        tap(() => this.page$.next(1))
      );
  }

  softDelete(id: number): Observable<any> {
    return this.api.delete(`projects/${id}`)
      .pipe(
        tap(() => this.page$.next(1))
      );
  }
}
