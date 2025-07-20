import { Component, OnInit } from '@angular/core';
import { BookService } from '../../services/book.service';
import { Book } from '../../interfaces/book';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-my-books',
  standalone: true,
  imports: [ CommonModule, RouterModule],
  templateUrl: './my-books.component.html',
  styleUrls: ['./my-books.component.css']
})
export class MyBooksComponent implements OnInit {
  myBooks: Book[] = [];
  loading = true;
  error: string = '';

  constructor(
    private bookService: BookService,
    private router: Router //  Inject Router for navigation
  ) {}

  ngOnInit(): void {
    this.bookService.getMyBooks().subscribe({
      next: (books) => {
        this.myBooks = books;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error fetching books. Please try again later.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  //  Navigate to Add Book form
  navigateToAddBook() {
    this.router.navigate(['/author/add-book']);
  }

  //  Navigate to Edit Book
  editBook(bookId: string) {
    this.router.navigate(['/author/edit-book', bookId]);
  }

  
toastMessage = '';
toastType: 'success' | 'error' = 'success';
toastVisible = false;

confirmVisible = false;
pendingDeleteId: string | null = null;

showToast(message: string, type: 'success' | 'error' = 'success') {
  this.toastMessage = message;
  this.toastType = type;
  this.toastVisible = true;
  setTimeout(() => this.toastVisible = false, 3000);
}

deleteBook(bookId: string) {
  this.pendingDeleteId = bookId;
  this.confirmVisible = true;
}

confirmDelete(confirm: boolean) {
  this.confirmVisible = false;

  if (!confirm || !this.pendingDeleteId) {
    this.pendingDeleteId = null;
    return;
  }

  this.bookService.deleteBook(this.pendingDeleteId).subscribe({
    next: () => {
        const book = this.myBooks.find(b => b.id === this.pendingDeleteId);
        if (book) {
          (book as any).pendingDelete = true;
        }
      this.showToast(' Book deletion submitted and awaiting admin approval.', 'success');
      this.pendingDeleteId = null;
    },
    error: (err) => {
      this.showToast(' Failed to delete the book.', 'error');
      this.pendingDeleteId = null;
    }
  });
}


}
