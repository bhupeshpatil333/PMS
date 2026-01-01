import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard/dashboard.component';
import { ProjectListComponent } from './components/projects/project-list/project-list.component';
import { TaskListComponent } from './components/tasks/task-list/task-list.component';
import { authGuard } from './core/guards/auth.guard';
import { RegisterComponent } from './components/auth/register/register/register.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    // { path: 'home', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
    { path: 'projects', component: ProjectListComponent },
    { path: 'tasks/:projectId', component: TaskListComponent }
];
