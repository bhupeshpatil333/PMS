import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from '../../../services/user.service';
import { SharedMaterialModule } from '../../../shared/shared-material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-user-form',
    imports: [ReactiveFormsModule, SharedMaterialModule],
    templateUrl: './user-form.component.html',
    styleUrl: './user-form.component.scss'
})
export class UserFormComponent implements OnInit {
    form: FormGroup;
    isEditMode = false;
    showPasswordChange = false;
    roles = ['Admin', 'Manager', 'Employee'];

    constructor(
        private fb: FormBuilder,
        private userService: UserService,
        private dialogRef: MatDialogRef<UserFormComponent>,
        private snackBar: MatSnackBar,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.form = this.fb.group({
            fullName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: [''], // For create or when changing password
            role: ['Employee', Validators.required]
        });
    }

    ngOnInit(): void {
        if (this.data) {
            this.isEditMode = true;
            // Create a copy of the data without the password to avoid pre-filling it
            const { password, ...userData } = this.data;
            this.form.patchValue(userData);
            
            // Clear password field initially
            this.form.get('password')?.clearValidators();
            this.form.get('password')?.updateValueAndValidity();
        } else {
            this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
            this.form.get('password')?.updateValueAndValidity();
        }
    }

    submit() {
        if (this.form.invalid) return;
        
        let formData = { ...this.form.value };
        
        // For edit mode, only send password if it's being changed
        if (this.isEditMode) {
            // If password field is empty in edit mode, remove it from the request
            if (!formData.password) {
                const { password, ...updatedData } = formData;
                formData = updatedData;
            }
        }

        const request$ = this.isEditMode
            ? this.userService.updateUser(this.data.id, formData)
            : this.userService.createUser(formData);

        request$.subscribe({
            next: () => {
                this.snackBar.open(
                    this.isEditMode ? 'User updated successfully' : 'User created successfully',
                    'Close',
                    { duration: 3000 }
                );
                // Wrap in setTimeout to ensure it runs in the next tick
                setTimeout(() => {
                    this.dialogRef.close(true);
                }, 100);
            },
            error: (err) => {
                console.error(err);
                this.snackBar.open(
                    'Failed to save user. Please try again.',
                    'Close',
                    { duration: 3000, panelClass: ['error-snackbar'] }
                );
            }
        });
    }

    togglePasswordChange() {
        this.showPasswordChange = true;
        // Add validators when showing password field
        this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
        this.form.get('password')?.updateValueAndValidity();
    }

    close() {
        // Reset password change state
        this.showPasswordChange = false;
        if (this.isEditMode) {
            this.form.get('password')?.clearValidators();
            this.form.get('password')?.updateValueAndValidity();
        }
        this.dialogRef.close();
    }
}
