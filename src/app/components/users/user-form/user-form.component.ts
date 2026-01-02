import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from '../../../services/user.service';
import { SharedMaterialModule } from '../../../shared/shared-material.module';

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

        if (this.isEditMode) {
            this.userService.updateUser(this.data.id, this.form.value).subscribe({
                next: () => this.dialogRef.close(true),
                error: (err) => console.error(err)
            });
        } else {
            this.userService.createUser(this.form.value).subscribe({
                next: () => this.dialogRef.close(true),
                error: (err) => console.error(err)
            });
        }
    }

    close() {
        this.dialogRef.close();
    }
}
