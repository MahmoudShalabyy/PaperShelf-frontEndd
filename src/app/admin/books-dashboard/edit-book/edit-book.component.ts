import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Book } from '../../../interfaces/book';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

const API_URL = environment.apiBaseUrl + '/books';
const IMG_URL = environment.apiUrlForImgs;

@Component({
  selector: 'app-edit-book',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-book.component.html',
  styleUrls: ['./edit-book.component.css'],
})
export class EditBookComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  editBookForm!: FormGroup;
  imagePreviewUrl: string = '';
  selectedFileName: string | null = null;
  alert = {
    type: '',
    message: '',
    show: false,
  };

  bookId!: string;
  loading = false;
  
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.editBookForm = this.fb.group({
      coverImage: [''],
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

    this.route.paramMap.subscribe((params) => {
      const bookId = params.get('id');
      if (bookId) {
        this.loadBookData(bookId);
      }
    });
  }

  loadBookData(bookId: string): void {
    this.bookId = bookId;
    this.http.get<any>(`${API_URL}/${bookId}`).subscribe({
      next: (response) => {
        const book = response.data.book;
        this.editBookForm.patchValue({
          title: book.title,
          author: book.author,
          isbn: book.isbn,
          pages: book.pages,
          price: book.price,
          discount: book.discount,
          stock: book.stock,
          category: book.category,
          description: book.description,
          isBestseller: book.isBestseller,
          isFeatured: book.isFeatured,
          isNew: book.isNew,
          isApproved: book.isApproved,
        });
        this.imagePreviewUrl = IMG_URL + book.coverImage;
      },
      error: (err) => console.error('Error loading book data:', err),
    });
  }
  
  

  onUpdateBook(): void {
    if (this.editBookForm.invalid) {
      this.editBookForm.markAllAsTouched();
      return;
    }
  
    this.loading = true;
    const formValue = this.editBookForm.value;
    const formData = new FormData();
  
    for (const key in formValue) {
      if (formValue.hasOwnProperty(key) && key !== 'coverImage') {
        let value = formValue[key];
        if (typeof value === 'boolean') value = value ? 'true' : 'false';
        formData.append(key, value);
      }
    }
  
    const fileInputElement = this.fileInput.nativeElement;
    if (fileInputElement.files && fileInputElement.files.length > 0) {
      const file = fileInputElement.files[0];
      formData.append('coverImage', file);
    }

    this.http.put(`${API_URL}/${this.bookId}`, formData).subscribe({
      next: () => {
        this.showAlert('success', 'Book updated successfully!');
        this.loading = false;
      },
      error: (err) => {
        this.showAlert('error', 'Something went wrong while updating the book.');
        console.error(err);
        this.loading = false;
      },
    });
  }
  

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.previewAndUpload(file);
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
    setTimeout(() => (this.alert.show = false), 3000);
  }
}
