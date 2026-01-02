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
            dueDate: [new Date(), Validators.required],
            projectId: [this.data.projectId],
            assignedTo: [null, Validators.required]
        });
    }

    ngOnInit(): void {
        this.getAllUsers();
        if (this.data && this.data.task) {
            this.isEditMode = true;
            this.form.patchValue(this.data.task);
            this.form.patchValue({ projectId: this.data.projectId }); // Ensure projectId is kept
        } else if (this.data && this.data.projectId) {
            this.form.patchValue({ projectId: this.data.projectId });
        }
    }

    submit() {
        if (this.form.invalid) return;

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
