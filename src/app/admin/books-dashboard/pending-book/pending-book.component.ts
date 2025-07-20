import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BookPendingService } from '../../../services/book-pending.service';
import { Book } from '../../../interfaces/book';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { RouterLink, RouterLinkActive } from '@angular/router';

const API_URL = environment.apiBaseUrl + '/books';

@Component({
  selector: 'app-pending-book',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,RouterLink,RouterLinkActive],
  templateUrl: './pending-book.component.html',
  styleUrl: './pending-book.component.css'
})
export class PendingBookComponent implements OnInit{

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  books: Book[] = [];
  pagination: any;
  searchControl = new FormControl('');
  isLoading = false;
  currentPage = 1;
  addBookForm!: FormGroup;
  imagePreviewUrl: string | null = null;
  selectedFileName: string | null = null;
  errorMessage: string = '';
  validExtensions = /\.(jpg|jpeg|png|webp)$/i;

  alert = {
    type: '',     
    message: '',
    show: false
  };

  constructor(
    private BookPendingService: BookPendingService,
    private fb: FormBuilder,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    
    this.loadBooks();

    this.searchControl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(query => this.performSearch(query));

    this.addBookForm = this.fb.group({
      coverImage: [Validators.required],
      title: ['', [Validators.required, Validators.minLength(3)]],
      author: ['', Validators.required],
      isbn: ['', [Validators.required, Validators.minLength(13), Validators.maxLength(13)]],
      pages: [1, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0)]],
      discount: [0, [Validators.min(0), Validators.max(100)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      description: ['', Validators.maxLength(300)],
      isBestseller: [false],
      isFeatured: [false],
      isNew: [false],
      isApproved: [true],
    });
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onDivClick(event: MouseEvent): void {
    event.stopPropagation();
    this.triggerFileInput();
  }

  loadBooks(): void {
    this.isLoading = true;
    const filters = {};
    const page = this.currentPage;
    const limit = 10;

    this.BookPendingService.getBooks(filters, page, limit).subscribe({
      next: (res) => {
        this.books = res.data.books;
        this.pagination = res.data.pagination;
      },
      error: (err) => console.error('Error loading books:', err),
      complete: () => this.isLoading = false
    });
  }

  loadPage(page: number): void {
    if (!this.pagination) return;
    const totalPages = this.pagination.totalPages || 1;
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;

    this.isLoading = true;
    const filters = {};
    const limit = 10;
    const trimmedQuery = (this.searchControl.value ?? '').trim();

    const loadObservable = trimmedQuery
      ? this.BookPendingService.searchBooks(trimmedQuery, page, limit)
      : this.BookPendingService.getBooks(filters, page, limit);

    loadObservable.subscribe({
      next: (res) => {
        this.books = res.data.books;
        this.pagination = res.data.pagination;
        this.currentPage = page;
      },
      error: (err) => console.error('Error loading page:', err),
      complete: () => this.isLoading = false
    });
  }

  performSearch(query: string | null): void {
    const trimmedQuery = (query ?? '').trim();
    if (!trimmedQuery) {
      this.loadBooks();
      return;
    }

    this.isLoading = true;
    this.BookPendingService.searchBooks(trimmedQuery).subscribe({
      next: (res) => {
        this.books = res.data.books;
        this.pagination = res.data.pagination;
      },
      error: (err) => console.error('Error searching books:', err),
      complete: () => this.isLoading = false
    });
  }

  onSearch(): void {
    this.performSearch(this.searchControl.value);
  }

  onAddBook(): void {
    if (this.addBookForm.invalid) {
      this.addBookForm.markAllAsTouched();
      return;
    }

    const formValue = this.addBookForm.value;
    const formData = new FormData();

    for (const key in formValue) {
      if (formValue.hasOwnProperty(key)) {
        let value = formValue[key];
        if (typeof value === 'boolean') value = value ? true : false;
        formData.append(key, value);
      }
    }

    const fileInputElement = this.fileInput.nativeElement;
    if (fileInputElement.files && fileInputElement.files.length > 0) {
      const file = fileInputElement.files[0];
      formData.append('coverImage', file);
    } else {
      console.error('No cover image selected!');
      return;
    }

    this.http.post(API_URL, formData).subscribe({
      next: (res) => {
        
        this.loadBooks();
        this.resetAddBookForm();
        this.imagePreviewUrl = null;
        this.selectedFileName = null;
        this.showAlert('success', 'Book added successfully!');
      },
      error: (err) => {
        this.showAlert('error', 'Something went wrong while adding book.');
        
      }
    });
  }

  resetAddBookForm(): void {
    this.addBookForm.reset({
      coverImage: null,
      title: '',
      author: '',
      isbn: '',
      pages: 1,
      price: 0,
      discount: 0,
      stock: 0,
      category: '',
      description: '',
      isBestseller: false,
      isFeatured: false,
      isNew: false,
      isApproved: true,
    });
    this.imagePreviewUrl = null;
    this.selectedFileName = null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.previewAndUpload(file);
      if (!this.validExtensions.test(file.name)) {
        this.showAlert('error', 'Please upload a valid image.');
        return;
      }
    }
  }

  previewAndUpload(file: File): void {
    if (!file) return;
    this.selectedFileName = file.name;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreviewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  showAlert(type: 'success' | 'error', message: string): void {
    this.alert.type = type;
    this.alert.message = message;
    this.alert.show = true;
    setTimeout(() => this.alert.show = false, 3000);
  }

  toggleBestseller(book: Book, newValue: boolean): void {
    const updateData = { isBestseller: newValue };
    this.http.put(`${API_URL}/${book.id}`, updateData).subscribe({
      next: () => {
        book.isBestseller = newValue;
        this.showAlert('success', 'Bestseller status updated successfully!');
      },
      error: (err) => {
        console.error('Failed to update bestseller status:', err);
        this.showAlert('error', 'Error updating bestseller status. Try again.');
      }
    });
  }

  toggleFeatured(book: Book, newValue: boolean): void {
    const updateData = { isFeatured: newValue };
    this.http.put(`${API_URL}/${book.id}`, updateData).subscribe({
      next: () => {
        book.isFeatured = newValue;
        this.showAlert('success', 'Featured status updated successfully!');
      },
      error: (err) => {
        console.error('Failed to update featured status:', err);
        this.showAlert('error', 'Error updating featured status. Try again.');
      }
    });
  }
  getCheckedValue(event: Event): boolean {
    return (event.target as HTMLInputElement).checked;
  }

}
