import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { take } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProjectService } from '../../../services/project.service';
import { SharedMaterialModule } from '../../../shared/shared-material.module';
import { User } from '../../../models/user.interface';
import { AuthService } from '../../../services/auth.service';

import { HasRoleDirective } from '../../../core/directives/has-role.directive';

const dateRangeValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;
    return start && end && new Date(start) > new Date(end) ? { dateRange: true } : null;
};

@Component({
    selector: 'app-project-form',
    imports: [ReactiveFormsModule, SharedMaterialModule, HasRoleDirective],
    templateUrl: './project-form.component.html',
    styleUrl: './project-form.component.scss'
})
export class ProjectFormComponent implements OnInit {
    form: FormGroup;
    isEditMode = false;
    projectStatuses = ['Pending', 'In Progress', 'Completed', 'On Hold'];
    users: User[] = [];

    constructor(
        private fb: FormBuilder,
        private projectService: ProjectService,
        private authService: AuthService,
        private dialogRef: MatDialogRef<ProjectFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.form = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            description: [''],
            status: ['Pending', Validators.required],
            startDate: [null, Validators.required],
            endDate: [null, Validators.required],
            managerId: [null]
        }, { validators: dateRangeValidator });
    }

    ngOnInit(): void {
        this.authService.user$.pipe(take(1)).subscribe(user => {
            if (user && user.role === 'Admin') {
                this.authService.getAllManagers().subscribe(users => {
                    this.users = users;
                });
            }
        });

        if (this.data && this.data.id) {
            this.isEditMode = true;
            this.form.patchValue(this.data);
        }
    }

    submit() {
        if (this.form.invalid) return;

        const formData = this.form.value;

        // Auto-assign Manager if current user is a Manager creating the project
        this.authService.user$.pipe(take(1)).subscribe(user => {
            if (user && user.role === 'Manager' && !formData.managerId) {
                formData.managerId = user.id;
            }

            this.processSubmit(formData);
        });
    }

    processSubmit(data: any) {
        if (this.isEditMode) {
            this.projectService.updateProject(this.data.id, data).subscribe({
                next: (res) => {
                    this.dialogRef.close(true);
                },
                error: (err) => console.error(err)
            });
        } else {
            this.projectService.createProject(data).subscribe({
                next: (res) => {
                    this.dialogRef.close(true);
                },
                error: (err) => console.error(err)
            });
        }
    }

    getInitials(name: string): string {
        return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '';
    }

    close() {
        this.dialogRef.close();
    }
}
