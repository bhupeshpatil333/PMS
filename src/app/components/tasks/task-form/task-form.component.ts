import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TaskService } from '../../../services/task.service';
import { SharedMaterialModule } from '../../../shared/shared-material.module';
import { User } from '../../../models/user.interface';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-task-form',
    imports: [ReactiveFormsModule, SharedMaterialModule],
    templateUrl: './task-form.component.html',
    styleUrl: './task-form.component.scss'
})
export class TaskFormComponent implements OnInit {
    form: FormGroup;
    isEditMode = false;
    priorities = ['Low', 'Medium', 'High'];
    statuses = ['To Do', 'In Progress', 'Done'];
    employees: User[] = [];

    constructor(
        private fb: FormBuilder,
        private taskService: TaskService,
        private authService: AuthService,
        private dialogRef: MatDialogRef<TaskFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.form = this.fb.group({
            title: ['', Validators.required],
            description: [''],
            priority: ['Medium', Validators.required],
            status: ['To Do', Validators.required],
            startDate: [new Date(), Validators.required],
            dueDate: [new Date(), Validators.required],
            projectId: [this.data.projectId],
            assignedTo: [null, Validators.required]
        });
    }

    ngOnInit(): void {
        this.getAllUsers();
        if (this.data && this.data.task) {
            this.isEditMode = true;
            const task = { ...this.data.task };

            // Format dates
            if (task.dueDate) {
                task.dueDate = new Date(task.dueDate).toISOString().split('T')[0];
            }
            if (task.startDate) {
                task.startDate = new Date(task.startDate).toISOString().split('T')[0];
            }

            // Fallback for assignedTo
            if (!task.assignedTo) {
                if (task.assignedUser) {
                    task.assignedTo = task.assignedUser.id;
                } else if (task.user) {
                    task.assignedTo = task.user.id;
                }
            }

            console.log('Patching Task:', task); // Debug log
            console.log('Employees List:', this.employees); // Debug log

            this.form.patchValue(task);
            this.form.patchValue({
                projectId: this.data.projectId,
                assignedTo: task.assignedTo
            });
        } else if (this.data && this.data.projectId) {
            this.form.patchValue({ projectId: this.data.projectId });
        }
    }

    submit() {
        if (this.form.invalid) return;

        console.log('Submitting Task Payload:', this.form.value); // Debug log

        if (this.isEditMode) {
            this.taskService.updateTask(this.data.task.id, this.form.value).subscribe({
                next: (res) => {
                    this.dialogRef.close(true);
                },
                error: (err) => console.error(err)
            });
        } else {
            this.taskService.createTask(this.form.value).subscribe({
                next: (res) => {
                    this.dialogRef.close(true);
                },
                error: (err) => console.error(err)
            });
        }
    }

    close() {
        this.dialogRef.close();
    }

    getAllUsers() {
        this.authService.getAllEmpUsers().subscribe({
            next: (res) => {
                this.employees = res;
            },
            error: (err) => console.error(err)
        });
    }
}
