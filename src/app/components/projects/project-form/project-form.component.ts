import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { take } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProjectService } from '../../../services/project.service';
import { SharedMaterialModule } from '../../../shared/shared-material.module';
import { User } from '../../../models/user.interface';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';

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
        private userService: UserService,
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
        console.log('ProjectFormComponent initialized with data:', this.data);

        // Check if we're in edit mode first
        if (this.data && this.data.id) {
            this.isEditMode = true;
        }

        // Load managers for dropdown (ONLY FOR ADMIN)
        this.authService.user$.pipe(take(1)).subscribe(user => {
            console.log('Current user:', user);

            if (user && user.role === 'Admin') {
                // Only Admins need to load managers list (for the Assign Manager dropdown)
                console.log('Loading managers list for Admin...');
                this.userService.getManagers().subscribe({
                    next: (users) => {
                        this.users = users;
                        console.log('Loaded managers:', this.users);

                        // Now that users are loaded, patch form values if in edit mode
                        if (this.isEditMode) {
                            this.patchFormData();
                        }
                    },
                    error: (err) => {
                        console.error('Error loading managers:', err);
                        // Even if loading fails, still patch the form
                        if (this.isEditMode) {
                            this.patchFormData();
                        }
                    }
                });
            } else {
                // Managers and other users don't need to load managers list
                console.log('Skipping managers list load for non-Admin user');
                // Just patch form data if in edit mode
                if (this.isEditMode) {
                    this.patchFormData();
                }
            }
        });
    }

    private patchFormData(): void {
        if (!this.data || !this.data.id) return;

        console.log('Patching form with data:', this.data);

        // Format dates properly for the form
        const projectData = { ...this.data };
        if (projectData.startDate) {
            // Convert date string to proper format for date input
            projectData.startDate = new Date(projectData.startDate).toISOString().split('T')[0];
        }
        if (projectData.endDate) {
            // Convert date string to proper format for date input
            projectData.endDate = new Date(projectData.endDate).toISOString().split('T')[0];
        }

        // Patch form values
        this.form.patchValue(projectData);

        console.log('Form values after patch:', this.form.value);
        console.log('ManagerId value:', this.form.get('managerId')?.value);
    }

    submit() {
        if (this.form.invalid) return;

        const formData = { ...this.form.value };

        console.log('Submitting form with data:', formData);
        console.log('Manager ID being submitted:', formData.managerId);

        // Format dates properly before sending to backend
        if (formData.startDate) {
            // Ensure date is in ISO string format
            formData.startDate = new Date(formData.startDate).toISOString();
        }
        if (formData.endDate) {
            // Ensure date is in ISO string format
            formData.endDate = new Date(formData.endDate).toISOString();
        }

        // Auto-assign Manager if current user is a Manager creating the project
        this.authService.user$.pipe(take(1)).subscribe(user => {
            if (user && user.role === 'Manager' && !formData.managerId) {
                formData.managerId = user.id;
                console.log('Auto-assigning manager:', user.id);
            }

            this.processSubmit(formData);
        });
    }

    processSubmit(data: any) {
        console.log('Processing submit with final data:', data);

        if (this.isEditMode) {
            console.log('Updating project:', this.data.id);
            this.projectService.updateProject(this.data.id, data).subscribe({
                next: (res) => {
                    console.log('Project updated successfully:', res);
                    this.dialogRef.close(true);
                },
                error: (err) => {
                    console.error('Error updating project:', err);
                }
            });
        } else {
            console.log('Creating new project');
            this.projectService.createProject(data).subscribe({
                next: (res) => {
                    console.log('Project created successfully:', res);
                    this.dialogRef.close(true);
                },
                error: (err) => {
                    console.error('Error creating project:', err);
                }
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
