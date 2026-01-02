import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../core/services/base-api.service';
import { User } from '../models/user.interface';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    constructor(private api: BaseApiService) { }

    getAllUsers(): Observable<User[]> {
        return this.api.get<User[]>('users');
    }

    getEmployees(): Observable<User[]> {
        return this.api.get<User[]>('users/employees');
    }

    createUser(user: any): Observable<any> {
        return this.api.post('users', user);
    }

    updateUser(id: number, user: any): Observable<any> {
        return this.api.put(`users/${id}`, user);
    }

    deleteUser(id: number): Observable<any> {
        return this.api.delete(`users/${id}`);
    }
}
