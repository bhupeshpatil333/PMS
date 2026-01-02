import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from '../../../services/user.service';
import { SharedMaterialModule } from '../../../shared/shared-material.module';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-user-form',
    imports: [ReactiveFormsModule, SharedMaterialModule],
    templateUrl: './user-form.component.html',
    styleUrl: './user-form.component.scss'
})
export class UserFormComponent implements OnInit {
    form: FormGroup;
    isEditMode = false;
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
            password: [''], // Required only for create
            role: ['Employee', Validators.required]
        });
    }

    ngOnInit(): void {
        if (this.data) {
            this.isEditMode = true;
            this.form.patchValue(this.data);
            this.form.get('password')?.clearValidators(); // No password update here for simplicity
            this.form.get('password')?.updateValueAndValidity();
        } else {
            this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
        }
    }

    submit() {
        if (this.form.invalid) return;

        const request$ = this.isEditMode
            ? this.userService.updateUser(this.data.id, this.form.value)
            : this.userService.createUser(this.form.value);

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

    close() {
        this.dialogRef.close();
    }
}
