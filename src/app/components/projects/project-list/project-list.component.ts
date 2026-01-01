import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { SharedMaterialModule } from '../../../shared/shared-material.module';
import { ProjectService } from '../../../services/project.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-project-list',
  imports: [SharedMaterialModule, ReactiveFormsModule],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.scss'
})
export class ProjectListComponent implements OnInit {
  projects$;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  searchControl = new FormControl('');

  dataSource = new MatTableDataSource<any>();

  constructor(private projectService: ProjectService) {
    this.projects$ = this.projectService.projects$;
  }

  ngOnInit() {
    // this.projectService.loadProjects();
    // this.projectService.getProjects().subscribe(res => {
    //   this.dataSource.data = res;
    //   this.dataSource.paginator = this.paginator;
    // });

    this.searchControl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(value => {
      this.projectService.setSearch(value || '');
    });
  }

  applyFilter(event: any) {
    this.dataSource.filter = event.target.value.trim().toLowerCase();
  }

  pageChange(event: PageEvent) {
    this.projectService.setPage(event.pageIndex + 1);
  }
}
