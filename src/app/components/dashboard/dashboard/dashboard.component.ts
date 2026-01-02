import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProjectService } from '../../../services/project.service';
import { map, Observable, switchMap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  stats$!: Observable<any>;

  constructor(private projectService: ProjectService, private authService: AuthService) { }

  ngOnInit() {
    this.stats$ = this.authService.user$.pipe(
      switchMap(user => {
        if (user?.role === 'Employee') {
          return this.projectService.getMyAllProjects();
        }
        return this.projectService.getAllProjects();
      }),
      map((projects: any[]) => {
        return {
          total: projects.length,
          pending: projects.filter((p: any) => p.status === 'Pending').length,
          inProgress: projects.filter((p: any) => p.status === 'In Progress').length,
          completed: projects.filter((p: any) => p.status === 'Completed').length,
          onHold: projects.filter((p: any) => p.status === 'On Hold').length,
          toDo: projects.filter((p: any) => p.status === 'To Do').length,
          recent: projects.slice(0, 5)
        };
      })
    );
  }
}
