import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TaskService } from '../../../services/task.service';
import { AsyncPipe, DatePipe } from '@angular/common';
import { map, Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { TaskFormComponent } from '../task-form/task-form.component';

@Component({
  selector: 'app-task-list',
  imports: [AsyncPipe, DatePipe],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss'
})
export class TaskListComponent implements OnInit {
  projectId: number | null = null;
  tasks$!: Observable<any[]>;

  todoTasks$!: Observable<any[]>;
  inProgressTasks$!: Observable<any[]>;
  doneTasks$!: Observable<any[]>;

  constructor(private route: ActivatedRoute, private taskService: TaskService, private dialog: MatDialog) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('projectId');
      if (id) {
        this.projectId = +id;
        this.loadTasks(this.projectId);
      }
    });
  }

  loadTasks(id: number) {
    this.tasks$ = this.taskService.getTasksByProject(id);

    // Naive filtering for demo purposes (ideally backend filters or single stream with map)
    this.todoTasks$ = this.tasks$.pipe(map(tasks => tasks.filter(t => t.status === 'Wiki' || t.status === 'To Do' || !t.status)));
    this.inProgressTasks$ = this.tasks$.pipe(map(tasks => tasks.filter(t => t.status === 'In Progress')));
    this.doneTasks$ = this.tasks$.pipe(map(tasks => tasks.filter(t => t.status === 'Done')));
  }

  openTaskForm(task?: any) {
    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: '600px',
      data: { projectId: this.projectId, task: task || null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.projectId) {
        this.loadTasks(this.projectId);
      }
    });
  }

  deleteTask(task: any) {
    if (confirm(`Are you sure you want to delete ${task.name}?`)) {
      this.taskService.deleteTask(task.id).subscribe(() => {
        if (this.projectId) this.loadTasks(this.projectId);
      });
    }
  }
}
