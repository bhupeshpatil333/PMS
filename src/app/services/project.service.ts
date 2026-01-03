import { Injectable } from '@angular/core';
import { BehaviorSubject, tap, shareReplay, Observable, combineLatest, switchMap, map, forkJoin, of, debounceTime, distinctUntilChanged, catchError } from 'rxjs';
import { BaseApiService } from '../core/services/base-api.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private _page$ = new BehaviorSubject<number>(1);
  private _search$ = new BehaviorSubject<string>('');

  private refresh$ = new BehaviorSubject<void>(undefined);
  private allProjectsCache: any[] | null = null;
  private myAllProjectsCache: any[] | null = null;
  private projectByIdCache = new Map<number, any>();

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
        tap(() => {
          this._page$.next(1);
          // Invalidate caches when a project is created
          this.allProjectsCache = null;
          this.myAllProjectsCache = null;
          this.projectByIdCache.clear();
          // Trigger refresh to reload the list
          this.refresh();
        })
      );
  }

  getAllProjects(): Observable<any[]> {
    if (this.allProjectsCache) {
      return of(this.allProjectsCache);
    }
    return this.api.get<any[]>('projects').pipe(
      tap(projects => this.allProjectsCache = projects)
    );
  }

  getProject(id: number): Observable<any> {
    if (this.projectByIdCache.has(id)) {
      return of(this.projectByIdCache.get(id)!);
    }
    return this.api.get<any>(`projects/${id}`).pipe(
      tap(project => this.projectByIdCache.set(id, project))
    );
  }

  updateProject(id: number, data: any): Observable<any> {
    return this.api.put<any>(`projects/${id}`, data)
      .pipe(
        tap(() => {
          this._page$.next(1); // Reset page on update? Maybe not needed but safe
          // Invalidate caches when a project is updated
          this.allProjectsCache = null;
          this.myAllProjectsCache = null;
          this.projectByIdCache.delete(id);
          // Trigger refresh to reload the list
          this.refresh();
        })
      );
  }

  softDelete(id: number): Observable<any> {
    return this.api.delete(`projects/${id}`)
      .pipe(
        tap(() => {
          this._page$.next(1);
          // Invalidate caches when a project is deleted
          this.allProjectsCache = null;
          this.myAllProjectsCache = null;
          this.projectByIdCache.delete(id);
        })
      );
  }

  getMyProjects(page: number, search: string): Observable<any> {
    console.log('getMyProjects called with page:', page, 'search:', search);

    return this.api.get<any>('projects/assigned-to-me', {
      page,
      pageSize: 5,
      search
    }).pipe(
      tap(response => {
        console.log('Backend response for assigned-to-me:', response);
      }),
      map(response => {
        if (Array.isArray(response)) {
          console.log('Response is array, length:', response.length);
          return {
            data: response,
            totalCount: response.length
          };
        }
        console.log('Response is object:', response);
        return response;
      }),
      catchError(err => {
        console.error('Error fetching assigned projects:', err);
        throw err;
      })
    );
  }

  getMyAllProjects(): Observable<any[]> {
    if (this.myAllProjectsCache) {
      return of(this.myAllProjectsCache);
    }
    return this.api.get<any>('projects/assigned-to-me').pipe(
      tap(projects => {
        const projectList = Array.isArray(projects) ? projects : projects.data || projects.items || [];
        this.myAllProjectsCache = projectList;
      }),
      map((res: any) => {
        if (Array.isArray(res)) return res;
        return res.data || res.items || [];
      })
    );
  }
}
