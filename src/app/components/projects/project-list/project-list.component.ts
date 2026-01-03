import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { AuthService } from '../../../services/auth.service';
import { combineLatest, of, forkJoin, shareReplay } from 'rxjs';
import { map, switchMap, catchError, take } from 'rxjs/operators';
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
        // Only make API calls if user is authenticated
        if (!user) {
          // Return empty result for unauthenticated users
          return of({ data: [], totalCount: 0 });
        }
        
        let projectsO$;
        if (user.role === 'Admin') {
          // Only Admins can see all projects
          projectsO$ = this.projectService.projects$;
        } else {
          // Managers and Employees can only see projects assigned to them
          projectsO$ = combineLatest([this.projectService.page$, this.projectService.search$]).pipe(
            switchMap(([page, search]) => this.projectService.getMyProjects(page, search))
          );
        }

        return projectsO$.pipe(
          switchMap((res: any) => {
            const projects = res.data || [];
            if (!projects.length) return of(res);

            // Check user role to determine which projects to show
            return this.authService.user$.pipe(
              take(1),
              switchMap((user: any) => {
                if (user && user.role === 'Employee') {
                  // For employees, only fetch tasks for projects to determine which projects to show
                  const projectIds = projects.map((p: any) => p.id);
                  
                  // Fetch all tasks for all projects in a single batch operation
                  return this.taskService.getTasksByMultipleProjects(projectIds).pipe(
                    map((allTasks: any[][]) => {
                      // Assign tasks to each project
                      allTasks.forEach((tasks: any[], index: number) => {
                        projects[index].tasks = tasks;
                      });
                      
                      // Filter projects to only include those where employee has assigned tasks
                      const userId = user.id;
                      const filteredProjects = projects.filter((project: any) => {
                        return project.tasks && project.tasks.some((task: any) => {
                          // Check if task is assigned to current user
                          if (task.assignedUser && task.assignedUser.id) {
                            return task.assignedUser.id === userId;
                          }
                          return task.assignedTo === userId;
                        });
                      });
                      
                      // Return filtered result
                      return {
                        ...res,
                        data: filteredProjects
                      };
                    }),
                    catchError(() => {
                      // If batch operation fails, return empty result for employee
                      return of({ ...res, data: [] });
                    })
                  );
                } else {
                  // For managers and admins, fetch tasks and return all projects
                  const projectIds = projects.map((p: any) => p.id);
                  
                  // Fetch all tasks for all projects in a single batch operation
                  return this.taskService.getTasksByMultipleProjects(projectIds).pipe(
                    map((allTasks: any[][]) => {
                      // Assign tasks to each project
                      allTasks.forEach((tasks: any[], index: number) => {
                        projects[index].tasks = tasks;
                      });
                      return res;
                    }),
                    catchError(() => {
                      // If batch operation fails, assign empty arrays
                      projects.forEach((p: any) => p.tasks = []);
                      return of(res);
                    })
                  );
                }
              })
            );
          })
        );
      }),
      shareReplay(1)
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
          // List automatically refreshes via service observable tap
        });
      }
    });
  }
}
