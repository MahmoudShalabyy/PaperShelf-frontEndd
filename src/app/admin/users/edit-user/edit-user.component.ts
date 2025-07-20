import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserAdminService } from '../../../services/user-admin.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,RouterLink],
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {
  userId!: string;
  userForm!: FormGroup;
  loading = true;
  error: string | null = null;
  showSuccessAlert = false;
  showErrorAlert = false;
  showDeleteConfirm = false;

  lastloginUser:string = "";
  createUser:string = "";
  updateUser:string = "";

  constructor(
    private route: ActivatedRoute,
    private userAdminService: UserAdminService,
    private fb: FormBuilder,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id')!;
    

    this.userAdminService.getUserById(this.userId).subscribe({
      next: (res) => {
        const user = res.user;
        this.userForm = this.fb.group({
          name: [user.name, [Validators.required, Validators.minLength(3)]],
          email: [user.email, [Validators.required, Validators.email]],
          role: [user.role, Validators.required],
          isActive: [user.isActive],
          isEmailVerified: [user.isEmailVerified]
        });
        this.lastloginUser = user.lastLogin;
        this.createUser = user.createdAt;
        this.updateUser = user.updatedAt;
        this.loading = false;
      },
      error: (err) => {
        console.error('[API Error] Failed to load user:', err);
        this.error = 'Failed to load user data';
        this.loading = false;
      }
    });
  }
  onSubmit() {
    if (this.userForm.invalid) return;

    

    const payload = { ...this.userForm.value };
    delete payload.email;

    this.userAdminService.updateUser(this.userId, payload).subscribe({
      next: (res: any) => {
        
        const updatedUser = res.user;
        this.userForm.patchValue({
          name: updatedUser.name,
          role: updatedUser.role,
          isActive: updatedUser.isActive,
          isEmailVerified: updatedUser.isEmailVerified,
        });

        this.showSuccessAlert = true;
        setTimeout(() => {
          this.showSuccessAlert = false;
        }, 5000);
      },
      error: (err) => {
        console.error('[API Error] Failed to update user:', err);
        this.showErrorAlert = true;
        setTimeout(() => {
          this.showErrorAlert = false;
        }, 5000);
      }
    });
  }
  // onSubmit() {
  //   if (this.userForm.invalid) return;

  //   

  //   const payload = { ...this.userForm.value };
  //   delete payload.email; // ⛔️ remove email before sending to backend

  //   this.userAdminService.updateUser(this.userId, payload).subscribe({
  //     next: (res: any) => {
  //       
  //       const updatedUser = res.user;
  //       this.userForm.patchValue({
  //         name: updatedUser.name,
  //         role: updatedUser.role,
  //         isActive: updatedUser.isActive,
  //         isEmailVerified: updatedUser.isEmailVerified,
  //       });

  //       this.showSuccessAlert = true;
  //       setTimeout(() => {
  //         this.showSuccessAlert = false;
  //       }, 5000);
  //     },
  //     error: (err) => {
  //       console.error('[API Error] Failed to update user:', err);
  //       this.showErrorAlert = true;
  //       setTimeout(() => {
  //         this.showErrorAlert = false;
  //       }, 5000);
  //     }
  //   });
  
  confirmDelete() {
    this.userAdminService.deleteUser(this.userId).subscribe({
      next: () => {
        this.router.navigate(['/dashboard/users'], { state: { deleteSuccess: true } });
      },
      error: (err) => {
        console.error('[Delete Error]', err);
      }
    });
  }

}
