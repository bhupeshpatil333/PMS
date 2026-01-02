import { Injectable } from '@angular/core';
import { BehaviorSubject, tap, shareReplay, Observable, combineLatest, switchMap, map } from 'rxjs';
import { BaseApiService } from '../core/services/base-api.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private _page$ = new BehaviorSubject<number>(1);
  private _search$ = new BehaviorSubject<string>('');

  private refresh$ = new BehaviorSubject<void>(undefined);

  constructor(private api: BaseApiService) { }

  get page$() { return this._page$.asObservable(); }
  get search$() { return this._search$.asObservable(); }

  projects$ = combineLatest([this._page$, this._search$, this.refresh$]).pipe(
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
    this._page$.next(page);
  }

  setSearch(text: string) {
    this._search$.next(text);
  }

  createProject(data: any): Observable<any> {
    return this.api.post<any>('projects', data)
      .pipe(
        tap(() => this._page$.next(1))
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
        tap(() => this._page$.next(1)) // Reset page on update? Maybe not needed but safe
      );
  }

  softDelete(id: number): Observable<any> {
    return this.api.delete(`projects/${id}`)
      .pipe(
        tap(() => this._page$.next(1))
      );
  }

  getMyProjects(page: number, search: string): Observable<any> {
    return this.api.get<any>('projects/assigned-to-me', {
      page,
      pageSize: 5,
      search
    });
  }

  getMyAllProjects(): Observable<any[]> {
    return this.api.get<any>('projects/assigned-to-me').pipe(
      map((res: any) => res.data || res.items || [])
    );
  }
}
