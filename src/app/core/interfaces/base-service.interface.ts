import { Observable } from 'rxjs';

export interface IBaseService<T, TCreate = Partial<T>, TUpdate = Partial<T>> {
  getAll(): Observable<T[]>;
  getById(id: number): Observable<T>;
  create(item: TCreate): Observable<T>;
  update(id: number, item: TUpdate): Observable<T>;
  delete(id: number): Observable<void>;
}