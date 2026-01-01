import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { SharedMaterialModule } from '../../../../shared/shared-material.module';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, SharedMaterialModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder, private auth: AuthService) {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['Employee']
    });
  }

  register() {
    this.auth.register(this.form.value).subscribe({
      next: () => alert('User Registered'),
      error: (err: any) => alert(err.error)
    });
  }

}
