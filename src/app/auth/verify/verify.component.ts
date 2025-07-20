import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './verify.component.html',
  styleUrl: './verify.component.css'
})
export class VerifyComponent implements OnInit {

  verifyForm: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  userEmail: string = '';
  isFromLogin: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.verifyForm = this.fb.group({
      otp: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(6)
      ]]
    });
  }

  ngOnInit() {
    // Check if user data exists (from unverified login)
    const unverifiedUser = this.authService.getUnverifiedUserData();
    if (unverifiedUser) {
      this.userEmail = unverifiedUser.email;
      this.isFromLogin = true;
    }
  }

  onSubmit() {
    this.errorMessage = null;
    this.successMessage = null;
    this.verifyForm.markAllAsTouched();

    if (this.verifyForm.valid) {
      const { otp } = this.verifyForm.value;

      this.authService.verifyEmail({ otp }).subscribe({
        next: (response) => {
          
          this.successMessage = 'Email verified successfully!';

          // Clear unverified user data if it exists
          this.authService.clearUnverifiedUserData();

          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 2000);
        },
        error: (err: any) => {
          
          this.errorMessage = err.error?.message || 'OTP verification failed. Please try again.';
        }
      });
    } else {
      this.errorMessage = 'Please enter the OTP code correctly.';
    }
  }

  resendOTP() {
    if (!this.userEmail) {
      this.errorMessage = 'Email address is required to resend OTP.';
      return;
    }

    this.authService.resendVerificationOTP({ email: this.userEmail }).subscribe({
      next: (response: any) => {
        this.successMessage = 'Verification OTP sent successfully!';
        setTimeout(() => {
          this.successMessage = null;
        }, 3000);
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Failed to resend OTP. Please try again.';
      }
    });
  }
}
