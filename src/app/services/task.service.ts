import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../core/services/base-api.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private api: BaseApiService) { }

  getTasksByProject(projectId: number): Observable<any[]> {
    return this.api.get<any[]>(`tasks/project/${projectId}`);
  }

  updateStatus(id: number, status: string): Observable<any> {
    return this.api.put(`tasks/${id}/status?status=${status}`);
  }
}
