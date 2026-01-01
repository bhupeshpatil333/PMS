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

@Component({
  selector: 'app-project-list',
  imports: [SharedMaterialModule, ReactiveFormsModule, AsyncPipe, RouterLink],
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
    if (confirm(`Are you sure you want to delete ${project.name}?`)) {
      this.projectService.softDelete(project.id).subscribe();
    }
  }
}
