import { Injectable } from '@angular/core';
import { Observable, tap, of, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseApiService } from '../core/services/base-api.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasksByProjectCache = new Map<number, any[]>();
  private myTasksCache: any[] | null = null;

  constructor(private api: BaseApiService) { }

  getTasksByProject(projectId: number): Observable<any[]> {
    if (this.tasksByProjectCache.has(projectId)) {
      return of(this.tasksByProjectCache.get(projectId)!);
    }
    return this.api.get<any[]>(`tasks/project/${projectId}`).pipe(
      tap(tasks => this.tasksByProjectCache.set(projectId, tasks))
    );
  }

  updateStatus(id: number, status: string): Observable<any> {
    return this.api.put(`tasks/${id}/status?status=${status}`, { status }).pipe(
      tap(() => {
        // Invalidate all project task caches when a task status is updated
        this.tasksByProjectCache.clear();
        this.myTasksCache = null; // Invalidate my tasks cache
      })
    );
  }

  createTask(data: any): Observable<any> {
    return this.api.post('tasks', data).pipe(
      tap(() => {
        // Invalidate all project task caches when a task is created
        this.tasksByProjectCache.clear();
        this.myTasksCache = null; // Invalidate my tasks cache
      })
    );
  }

  updateTask(id: number, data: any): Observable<any> {
    return this.api.put(`tasks/${id}`, data).pipe(
      tap(() => {
        // Invalidate all project task caches when a task is updated
        this.tasksByProjectCache.clear();
        this.myTasksCache = null; // Invalidate my tasks cache
      })
    );
  }

  deleteTask(id: number): Observable<any> {
    return this.api.delete(`tasks/${id}`).pipe(
      tap(() => {
        // Invalidate all project task caches when a task is deleted
        this.tasksByProjectCache.clear();
        this.myTasksCache = null; // Invalidate my tasks cache
      })
    );
  }

  getTasksByMultipleProjects(projectIds: number[]): Observable<any[][]> {
    // Create observables for each project's tasks
    const taskObservables = projectIds.map(projectId => this.getTasksByProject(projectId));
    
    // Use forkJoin to execute all requests in parallel
    return forkJoin(taskObservables);
  }

  getMyTasksForProject(projectId: number, userId: number): Observable<any[]> {
    // Get all tasks for the project and filter for the specific user
    return this.getTasksByProject(projectId).pipe(
      map(tasks => {
        // Filter tasks assigned to the specific user
        // API returns assignedUser object with id, not a direct assignedTo field
        return tasks.filter((task: any) => {
          if (task.assignedUser && task.assignedUser.id) {
            return task.assignedUser.id === userId;
          }
          // Fallback to assignedTo if assignedUser doesn't exist
          return task.assignedTo === userId;
        });
      }),
      tap(tasks => {
        // Cache the user's tasks for this project specifically
        this.myTasksCache = tasks;
      })
    );
  }
}
