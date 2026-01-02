import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProjectService } from '../../../services/project.service';
import { SharedMaterialModule } from '../../../shared/shared-material.module';

const dateRangeValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;
    return start && end && new Date(start) > new Date(end) ? { dateRange: true } : null;
};

@Component({
    selector: 'app-project-form',
    imports: [ReactiveFormsModule, SharedMaterialModule],
    templateUrl: './project-form.component.html',
    styleUrl: './project-form.component.scss'
})
export class ProjectFormComponent implements OnInit {
    form: FormGroup;
    isEditMode = false;
    projectStatuses = ['Pending', 'In Progress', 'Completed', 'On Hold'];

    constructor(
        private fb: FormBuilder,
        private projectService: ProjectService,
        private dialogRef: MatDialogRef<ProjectFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.form = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            description: [''],
            status: ['Pending', Validators.required],
            startDate: [null, Validators.required],
            endDate: [null, Validators.required]
        }, { validators: dateRangeValidator });
    }

    ngOnInit(): void {
        if (this.data && this.data.id) {
            this.isEditMode = true;
            this.form.patchValue(this.data);
        }
    }

    submit() {
        if (this.form.invalid) return;

        if (this.isEditMode) {
            this.projectService.updateProject(this.data.id, this.form.value).subscribe({
                next: (res) => {
                    this.dialogRef.close(true);
                },
                error: (err) => console.error(err)
            });
        } else {
            this.projectService.createProject(this.form.value).subscribe({
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
}
