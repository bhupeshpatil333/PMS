import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../../../services/project.service';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
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
          completed: projects.filter(p => p.status === 'Completed').length,
          onHold: projects.filter(p => p.status === 'On Hold').length,
          recent: projects.slice(0, 5)
        };
      })
    );
  }
}
