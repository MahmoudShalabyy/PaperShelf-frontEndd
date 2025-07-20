import { Component, AfterViewInit, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { RoleService } from '../../services/role.service';
import { CartService } from '../../services/cart.service';
import { environment } from '../../../environments/environment';

declare const google: any;

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.css']
})
export class RegisterFormComponent implements AfterViewInit {

  registerForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private roleService: RoleService,
    private cartService: CartService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private zone: NgZone
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(30),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$/)
      ]],
      role: ['user', Validators.required] // ✅ Default to 'user' role
    });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initGoogleButton();
    }
  }

  initGoogleButton(): void {
    const clientId = environment.googleClientId;

    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => this.handleGoogle(response.credential),
      });

      google.accounts.id.renderButton(
        document.getElementById('googleRegisterBtn'),
        { theme: 'outline', size: 'large', width: '100%' }
      );
    }
  }

  handleGoogle(credential: string): void {
    // Get the selected role from the form, default to 'user' if not selected
    const selectedRole = this.registerForm.get('role')?.value || 'user';

    this.authService.googleLogin(credential, selectedRole).subscribe({
      next: (response) => {
        this.zone.run(() => {
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);

          this.roleService.setUser({
            name: response.data.user.name,
            email: response.data.user.email,
            role: response.data.user.role,
            token: response.data.accessToken
          });

          this.cartService.refreshCart();

          const userRole = response.data.user.role;
          if (userRole === 'admin') {
            window.location.href = '/dashboard';
          } else {
            this.router.navigateByUrl('/home');
          }
        });
      },
      error: (err: any) => {
        this.zone.run(() => {
          this.errorMessage = err.error?.message || 'Google registration failed. Please try again.';
        });
      }
    });
  }

  onSubmit() {
    this.errorMessage = null;
    this.registerForm.markAllAsTouched();

    if (this.registerForm.valid) {
      const { name, email, password, role } = this.registerForm.value;

      this.authService.register({ name, email, password, role }).subscribe({
        next: (response) => {
          // Store user data for verification flow
          this.authService.setUnverifiedUserData({
            email: email,
            name: name,
            role: role
          });

          // Redirect to verify component for email verification
          this.router.navigate(['/auth/verify']);
        },
        error: (err: any) => {
          this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
        }
      });
    } else {
      this.errorMessage = 'Please correct the highlighted errors to proceed.';
    }
  }
}
