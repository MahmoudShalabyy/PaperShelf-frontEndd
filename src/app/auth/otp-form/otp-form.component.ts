import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-otp-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './otp-form.component.html',
  styleUrl: './otp-form.component.css'
})
export class OtpFormComponent {

  otpForm: FormGroup;
  errorMessage: string | null = null;
  verfiyMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private otpserv: AuthService,
    private router: Router
  ) {
    this.otpForm = this.fb.group({
      otp: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(6)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(30),
      ]]
    });
  }

  onSubmit() {
    this.errorMessage = null;
    this.otpForm.markAllAsTouched();

    if (this.otpForm.valid) {
      const { otp, password } = this.otpForm.value;

      this.otpserv.resetPassword({ otp, newPassword: password }).subscribe({
        next: (response) => {
          
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);
          this.verfiyMessage = 'Password changed successfully. Redirecting to login page...';
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 2000);
        },
        error: (err: any) => {
          this.errorMessage = err.error?.message || 'Code Sent failed. Please try again.';
        }
      });
    } else {
      this.errorMessage = 'Please correct the highlighted errors to proceed.';
    }
  }
}
