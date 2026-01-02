import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProjectService } from '../../../services/project.service';
import { map, Observable } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  stats$!: Observable<any>;

  constructor(private projectService: ProjectService) { }

  ngOnInit() {
    this.stats$ = this.projectService.getAllProjects().pipe(
      map(projects => {
        return {
          total: projects.length,
          pending: projects.filter(p => p.status === 'Pending').length,
          inProgress: projects.filter(p => p.status === 'In Progress').length,
          completed: projects.filter(p => p.status === 'Completed').length,
          onHold: projects.filter(p => p.status === 'On Hold').length,
          toDo: projects.filter(p => p.status === 'To Do').length,
          recent: projects.slice(0, 5) // Assuming projects are sorted by creation date
        };
      })
    );
  }
}
