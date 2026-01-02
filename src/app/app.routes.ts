import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard/dashboard.component';
import { ProjectListComponent } from './components/projects/project-list/project-list.component';
import { TaskListComponent } from './components/tasks/task-list/task-list.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { RegisterComponent } from './components/auth/register/register/register.component';
import { MainLayoutComponent } from './components/layout/main-layout/main-layout.component';
import { UserListComponent } from './components/users/user-list/user-list.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: DashboardComponent },
            {
                path: 'projects',
                component: ProjectListComponent,
                canActivate: [roleGuard],
                data: { roles: ['Admin', 'Manager'] }
            },
            { path: 'tasks/:projectId', component: TaskListComponent },
            {
                path: 'users',
                component: UserListComponent,
                canActivate: [roleGuard],
                data: { roles: ['Admin'] }
            }
        ]
    }
];
