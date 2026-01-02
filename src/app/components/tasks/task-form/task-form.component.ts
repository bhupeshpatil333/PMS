import { normalizePassiveListenerOptions } from '@angular/cdk/platform';
import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { TaskService } from '../../../services/task.service';
import { SharedMaterialModule } from '../../../shared/shared-material.module';
import { User } from '../../../models/user.interface';
import { AuthService } from '../../../services/auth.service';

/** Custom validator to ensure Due Date is after Start Date */
const dateRangeValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const start = group.get('startDate')?.value;
    const end = group.get('dueDate')?.value;
    return start && end && new Date(start) > new Date(end) ? { dateRange: true } : null;
};

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
        private dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.form = this.fb.group({
            title: ['', [Validators.required, Validators.minLength(3)]],
            description: [''],
            priority: ['Medium', Validators.required],
            status: ['To Do', Validators.required],
            startDate: [null], // Optional initially, but validated if present
            dueDate: [null, Validators.required],
            projectId: [this.data.projectId],
            assignedTo: [null, Validators.required]
        }, { validators: dateRangeValidator });
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
        if (this.form.dirty) {
            const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
                data: {
                    title: 'Discard Changes',
                    message: 'You have unsaved changes. Do you want to leave this page?',
                    confirmText: 'Leave',
                    cancelText: 'Stay',
                    type: 'discard'
                }
            });

            dialogRef.afterClosed().subscribe(result => {
                if (result) {
                    this.dialogRef.close();
                }
            });
        } else {
            this.dialogRef.close();
        }
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
