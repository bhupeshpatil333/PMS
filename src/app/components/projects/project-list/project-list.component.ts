import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
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

@Component({
  selector: 'app-project-list',
  imports: [SharedMaterialModule, ReactiveFormsModule, AsyncPipe, RouterLink, MatMenuModule, MatButtonModule, MatIconModule],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.scss'
})
export class ProjectListComponent implements OnInit {
  projects$;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  searchControl = new FormControl('');

  constructor(private projectService: ProjectService, private dialog: MatDialog) {
    this.projects$ = this.projectService.projects$;
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
