import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { AuthService } from '../../../services/auth.service';
import { combineLatest, of, forkJoin } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { TaskService } from '../../../services/task.service';
import { MatDialog } from '@angular/material/dialog';
import { SharedMaterialModule } from '../../../shared/shared-material.module';
import { ProjectService } from '../../../services/project.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProjectFormComponent } from '../project-form/project-form.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { HasRoleDirective } from '../../../core/directives/has-role.directive';

@Component({
  selector: 'app-project-list',
  imports: [SharedMaterialModule, ReactiveFormsModule, AsyncPipe, RouterLink, MatMenuModule, MatButtonModule, MatIconModule, HasRoleDirective],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.scss'
})
export class ProjectListComponent implements OnInit {
  projects$;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  searchControl = new FormControl('');

  constructor(
    private projectService: ProjectService,
    private dialog: MatDialog,
    private authService: AuthService,
    private taskService: TaskService
  ) {
    this.projects$ = this.authService.user$.pipe(
      switchMap(user => {
        let projectsO$;
        if (!user || user.role === 'Admin') {
          projectsO$ = this.projectService.projects$;
        } else {
          projectsO$ = combineLatest([this.projectService.page$, this.projectService.search$]).pipe(
            switchMap(([page, search]) => this.projectService.getMyProjects(page, search))
          );
        }

        return projectsO$.pipe(
          switchMap((res: any) => {
            const projects = res.data || [];
            if (!projects.length) return of(res);

            // Fetch tasks for each project to calculate progress
            const tasksRequests = projects.map((p: any) =>
              this.taskService.getTasksByProject(p.id).pipe(
                catchError(() => of([]))
              )
            );

            return forkJoin(tasksRequests).pipe(
              map((tasksLists: any) => {
                tasksLists.forEach((tasks: any, index: number) => {
                  projects[index].tasks = tasks;
                });
                return res;
              })
            );
          })
        );
      })
    );
  }

  getProgress(project: any): number {
    // If backend provides progress directly
    if (typeof project.progress === 'number') {
      return project.progress;
    }

    // If project has tasks array, calculate percentage of 'Done' tasks
    if (project.tasks && Array.isArray(project.tasks) && project.tasks.length > 0) {
      const completed = project.tasks.filter((t: any) => t.status === 'Done').length;
      return Math.round((completed / project.tasks.length) * 100);
    }

    return 0; // Default to 0 if no data
  }

  getCompletedTaskCount(project: any): string {
    if (project.tasks && Array.isArray(project.tasks) && project.tasks.length > 0) {
      const completed = project.tasks.filter((t: any) => t.status === 'Done').length;
      return `${completed}/${project.tasks.length}`;
    }
    return '0/0';
  }

  ngOnInit() {
    this.searchControl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(value => {
      this.projectService.setSearch(value || '');
    });
  }

  pageChange(event: PageEvent) {
    this.projectService.setPage(event.pageIndex + 1);
  }

  openForm(project?: any) {
    this.dialog.open(ProjectFormComponent, {
      width: '500px',
      data: project || {}
    });
  }

  deleteProject(project: any) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete Project?',
        message: `Are you sure you want to delete "${project.name}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'delete'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.projectService.softDelete(project.id).subscribe(() => {
          // Refresh list or rely on observable to update if implemented in service
          // Here we might need to manually trigger refresh or ensure observable emits
          // For now assuming subscriptions handle it or we force reload
          window.location.reload(); // Simple refresh to ensure state, better to use observable refresh
        });
      }
    });
  }
}
