import { Injectable } from '@angular/core';
import { Observable, tap, of } from 'rxjs';
import { BaseApiService } from '../core/services/base-api.service';
import { User } from '../models/user.interface';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private usersCache: User[] | null = null;
    private employeesCache: User[] | null = null;

    constructor(private api: BaseApiService) { }

    getAllUsers(): Observable<User[]> {
        if (this.usersCache) {
            return of(this.usersCache);
        }
        return this.api.get<User[]>('users').pipe(
            tap(users => this.usersCache = users)
        );
    }

    getEmployees(): Observable<User[]> {
        if (this.employeesCache) {
            return of(this.employeesCache);
        }
        return this.api.get<User[]>('users/employees').pipe(
            tap(employees => this.employeesCache = employees)
        );
    }

    createUser(user: any): Observable<any> {
        return this.api.post('users', user).pipe(
            tap(() => {
                // Invalidate cache when a new user is created
                this.usersCache = null;
                this.employeesCache = null;
            })
        );
    }

    updateUser(id: number, user: any): Observable<any> {
        return this.api.put(`users/${id}`, user).pipe(
            tap(() => {
                // Invalidate cache when a user is updated
                this.usersCache = null;
                this.employeesCache = null;
            })
        );
    }

    deleteUser(id: number): Observable<any> {
        return this.api.delete(`users/${id}`).pipe(
            tap(() => {
                // Invalidate cache when a user is deleted
                this.usersCache = null;
                this.employeesCache = null;
            })
        );
    }

    getManagers(): Observable<User[]> {
        if (this.usersCache) {
            // Filter managers from cached users if available
            return of(this.usersCache.filter(user => user.role === 'Manager'));
        }
        return this.api.get<User[]>('users/managers').pipe(
            tap(managers => {
                // We can't directly cache managers separately without affecting the main users cache
                // So we'll just return the filtered result
            })
        );
    }
}
