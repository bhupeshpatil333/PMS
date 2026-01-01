import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProjectService } from '../../../services/project.service';
import { SharedMaterialModule } from '../../../shared/shared-material.module';

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
            name: ['', Validators.required],
            description: [''],
            status: ['Pending']
        });
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
