import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserAdminService } from '../../../services/user-admin.service';

@Component({
  selector: 'app-list-users-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterLinkActive],
  templateUrl: './list-users-dashboard.component.html',
  styleUrls: ['./list-users-dashboard.component.css']
})
export class ListUsersDashboardComponent implements OnInit {
  users: any[] = [];
  pagination: any;
  searchControl = new FormControl('');
  isLoading = false;
  currentPage = 1;

  roleFilterControl = new FormControl(null);
  verifyFilterControl = new FormControl(null);
  activeFilterControl = new FormControl(null);


  alert = {
    type: '',
    message: '',
    show: false
  };

  constructor(
    private userAdminService: UserAdminService
  ) { }

  ngOnInit(): void {
    
    this.loadUsers();

    this.searchControl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => this.performSearch());

    this.roleFilterControl.valueChanges.subscribe(() => this.performSearch());
    this.verifyFilterControl.valueChanges.subscribe(() => this.performSearch());
    this.activeFilterControl.valueChanges.subscribe(() => this.performSearch());
  }

  loadUsers(): void {
    this.isLoading = true;
    const page = this.currentPage;
    const limit = 10;

    const role = this.roleFilterControl.value;

    this.userAdminService.getUsers(undefined,           // search
      role ?? undefined,   // role
      this.verifyFilterControl.value ?? undefined,  // verify
      this.activeFilterControl.value ?? undefined,  // active
      page,
      limit).subscribe({
        next: (res) => {
          
          this.users = res.data?.users ?? res.users;
          this.pagination = res.data?.pagination ?? res.pagination;
        },
        error: (err) => console.error('[API Error] Load users failed:', err),
        complete: () => this.isLoading = false
      });
  }

  loadPage(page: number): void {
    if (!this.pagination) return;
    const totalPages = this.pagination.totalPages || 1;
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;

    this.isLoading = true;
    const trimmedQuery = (this.searchControl.value ?? '').trim();
    const limit = 10;

    const role = this.roleFilterControl.value;

    const request$ = trimmedQuery
      ? this.userAdminService.getUsersWithSearch(trimmedQuery, page, limit)
      : this.userAdminService.getUsers(undefined,           // search
        role ?? undefined,   // role
        this.verifyFilterControl.value ?? undefined,  // verify
        this.activeFilterControl.value ?? undefined,  // active
        page,
        limit);

    request$.subscribe({
      next: (res) => {
        this.users = res.data?.users ?? res.users;
        this.pagination = res.data?.pagination ?? res.pagination;
        this.currentPage = page;
      },
      error: (err) => console.error('[API Error] Load page failed:', err),
      complete: () => this.isLoading = false
    });
  }


  performSearch(): void {
    const searchQuery = (this.searchControl.value ?? '').trim();
    const role = this.roleFilterControl.value;
    const verify = this.verifyFilterControl.value;
    const active = this.activeFilterControl.value;
  
    
  
    this.isLoading = true;
  
    this.userAdminService.getUsers(
      searchQuery || undefined,
      role || undefined,
      verify !== null ? verify : undefined,
      active !== null ? active : undefined,
      this.currentPage,
      10
    ).subscribe({
      next: (res) => {
        this.users = res.data?.users ?? res.users;
        this.pagination = res.data?.pagination ?? res.pagination;
      },
      error: (err) => console.error('[API Error] Search failed:', err),
      complete: () => this.isLoading = false
    });
  }
  

  resetFilters(): void {
    this.searchControl.setValue('');
    this.roleFilterControl.setValue(null);
    this.verifyFilterControl.setValue(null);
    this.activeFilterControl.setValue(null);
    this.currentPage = 1;
    this.loadUsers();
  }


  onSearch(): void {
    this.performSearch();
  }

  showAlert(type: 'success' | 'error', message: string): void {
    this.alert.type = type;
    this.alert.message = message;
    this.alert.show = true;
    setTimeout(() => this.alert.show = false, 3000);
  }
}
