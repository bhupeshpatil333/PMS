
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TaskService } from '../../../services/task.service';
import { AsyncPipe, DatePipe } from '@angular/common';
import { map, Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { TaskFormComponent } from '../task-form/task-form.component';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ProjectService } from '../../../services/project.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [AsyncPipe, DatePipe, DragDropModule, MatMenuModule, MatButtonModule, MatIconModule],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss'
})
export class TaskListComponent implements OnInit {
  projectId: number | null = null;
  projectName: string = 'Board'; // Default
  // Local state for drag and drop stability
  todoTasks: any[] = [];
  inProgressTasks: any[] = [];
  doneTasks: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private projectService: ProjectService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('projectId');
      if (id) {
        this.projectId = +id;
        this.loadProjectDetails(this.projectId);
        this.loadTasks(this.projectId);
      }
    });
  }

  loadProjectDetails(id: number) {
    this.projectService.getProject(id).subscribe(project => {
      this.projectName = project.name;
    });
  }

  loadTasks(id: number) {
    this.taskService.getTasksByProject(id).subscribe(tasks => {
      this.todoTasks = tasks.filter(t => t.status === 'Wiki' || t.status === 'To Do' || !t.status);
      this.inProgressTasks = tasks.filter(t => t.status === 'In Progress');
      this.doneTasks = tasks.filter(t => t.status === 'Done');
    });
  }

  openTaskForm(task?: any) {
    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: '600px',
      data: { projectId: this.projectId, task: task || null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.projectId) {
        this.loadTasks(this.projectId);
        this.projectService.refresh(); // Sync progress
      }
    });
  }

  deleteTask(task: any) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirm Delete?',
        message: 'Are you sure you want to delete this task?',
        confirmText: 'Yes, Delete',
        cancelText: 'Cancel',
        type: 'delete'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.taskService.deleteTask(task.id).subscribe(() => {
          if (this.projectId) {
            this.loadTasks(this.projectId);
            this.projectService.refresh(); // Sync progress
          }
        });
      }
    });
  }

  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );

      const task = event.container.data[event.currentIndex];
      const newStatus = event.container.id;

      // Update local object status immediate to reflect change if redrawn
      task.status = newStatus;

      this.updateTaskStatus(task.id, newStatus);
    }
  }

  updateTaskStatus(id: number, status: string) {
    this.taskService.updateStatus(id, status).subscribe({
      next: () => {
        this.projectService.refresh(); // Sync progress
      },
      error: () => {
        console.error('Failed to update status');
        // Revert could happen here, or simple reload
        if (this.projectId) this.loadTasks(this.projectId);
      }
    });
  }
}
