import { Observable } from 'rxjs';
import { User } from '../../models/user.interface';
import { CreateUserDto, UpdateUserDto } from './user-form.interface';

export interface IUserService {
    getAllUsers(): Observable<User[]>;
    getEmployees(): Observable<User[]>;
    getManagers(): Observable<User[]>;
    createUser(user: CreateUserDto): Observable<User>;
    updateUser(id: number, user: UpdateUserDto): Observable<User>;
    deleteUser(id: number): Observable<void>;
}
