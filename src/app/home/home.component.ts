import { Component, OnInit } from '@angular/core';
import { HomebookService } from '../services/homebook.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BookSliderComponent } from '../book-slider/book-slider.component';
import { environment } from '../../environments/environment'; 

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, BookSliderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  books: any[] = [];
  categories: { name: string; image: string }[] = [];
  authors: any[] = [];
  isLoading = true;
  error = '';
  selectedCategory: string = 'all';
   environment = environment;

  constructor(private bookService: HomebookService, private router: Router, private route: ActivatedRoute) {}

  goToDetails(bookId: string) {
    this.router.navigate(['/product', bookId]);
  }

  ngOnInit(): void {
    this.bookService.getBooks().subscribe({
      next: (res) => {
        this.books = res.data.books;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Error loading books';
        this.isLoading = false;
      },
    });

    this.bookService.getCategories().subscribe({
  next: (res) => {
    if (res.success && Array.isArray(res.data)) {
      this.categories = res.data;
    } else {
      this.categories = [];
    }
  },
  error: (err) => {
    this.categories = [];
  }
});



    this.bookService.getAuthors().subscribe((res) => {
      if (res.success) {
        this.authors = res.authors;
      }
    });
  }

  ngAfterViewInit(): void {
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        const element = document.getElementById(fragment);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  }

  goToCategory(categoryName: string) {
    this.router.navigate(['/shop'], {
      queryParams: { category: categoryName }
    });
  }

  getFilteredBooks() {
    if (this.selectedCategory === 'all') {
      return this.books.slice(1, 9);
    }
    return this.books.filter(
      (book) => book.category?.toLowerCase() === this.selectedCategory.toLowerCase()
    );
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
  }

  getFeaturedBooks() {
    return this.books.slice(3, 7);
  }

  getPopularBooks() {
    return this.books.slice(7, 15);
  }
}
