import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BookService } from '../../services/book.service';
import { FilterComponent } from '../filter/filter.component';
import { BookCardComponent } from '../../shared/book-card/book-card.component';
import { Book } from '../../interfaces/book';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';

import { InfiniteScrollModule } from 'ngx-infinite-scroll';

@Component({
  selector: 'app-main-shop',
  standalone: true,
  imports: [CommonModule, FilterComponent, BookCardComponent, FormsModule , InfiniteScrollModule],
  templateUrl: './main-shop.component.html',
  styleUrls: ['./main-shop.component.css']
})
export class MainShopComponent {
  books: Book[] = [];
  currentPage = 1;
  itemsPerPage = 8;
  currentFilters: any = {};
  showSearch: boolean = false;
  isLoading = false;
  searchQuery: string = '';
  wishlistUrl = `${environment.apiBase}/wishlist`;

  searchPage = 1;
  searchLoading = false;
  searchFinished = false;

  sort: string = 'createdAt'; // default sort field
  order: string = 'desc';     // default order

  totalPages = 1;
  wishlistIds: string[] = [];


  pagination: {
    currentPage: number;
    totalPages: number;
    totalBooks: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  } | null = null;

  private searchSubject = new Subject<string>();


  constructor(private bookService: BookService, private route: ActivatedRoute, private http: HttpClient) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.currentFilters = { ...this.currentFilters, category: params['category'] };
      } else {
        const { category, ...rest } = this.currentFilters;
        this.currentFilters = { ...rest };
      }
      this.currentPage = 1;
      this.loadBooks();
      this.loadWishlist();
      this.searchSubject.pipe(
        debounceTime(500)
      ).subscribe(query => {
        this.performSearch(query);
      });
    });
  }




  toggleSearch() {
    this.showSearch = !this.showSearch;
    setTimeout(() => {
      const input = document.getElementById('searchInput') as HTMLInputElement;
      if (input) input.focus();
    }, 0);
  }

  onSearchChange() {
    this.searchSubject.next(this.searchQuery);
  }

  performSearch(query: string) {
  if (!query.trim()) {
    this.books = [];
    this.pagination = null;
    this.loadBooks(); 
    return;
  }

  this.searchPage = 1;
  this.searchFinished = false;
  this.books = [];
  this.searchLoading = true;

  this.bookService.searchBooks(query, this.searchPage, this.itemsPerPage).subscribe({
    next: res => {
      this.books = res.data.books;
      if (res.data.books.length < this.itemsPerPage) {
        this.searchFinished = true;
      }
    },
    complete: () => {
      this.searchLoading = false;
    }
  });
}
onScrollSearch() {
  if (this.searchLoading || this.searchFinished) return;

  this.searchLoading = true;
  this.searchPage++;

  this.bookService.searchBooks(this.searchQuery, this.searchPage, this.itemsPerPage).subscribe({
    next: res => {
      const newBooks = res.data.books;
      this.books = [...this.books, ...newBooks];
      if (newBooks.length < this.itemsPerPage) {
        this.searchFinished = true;
      }
    },
    complete: () => {
      this.searchLoading = false;
    }
  });
}

  
  onFiltersApplied(filters: any) {
    this.currentFilters = { ...this.currentFilters, ...filters };
    this.currentPage = 1;
    this.loadBooks();
  }

  onPageChanged(page: number) {
    this.currentPage = page;
    this.loadBooks();
  }

  loadBooks() {
    this.isLoading = true;
    const filtersWithSort = {
      ...this.currentFilters,
      sort: this.sort,
      order: this.order
    };
    this.bookService.getBooks(filtersWithSort, this.currentPage, this.itemsPerPage).subscribe({
      next: res => {
        this.books = res.data.books;
        this.pagination = res.data.pagination;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  setSort(sortField: string, order: string) {
    this.sort = sortField;
    this.order = order;
    this.currentPage = 1;
    this.loadBooks();
  }

  loadWishlist() {
    this.http.get(this.wishlistUrl).subscribe({  
      next: (res: any) => {
        this.wishlistIds = res.data.map((item: any) => item._id);
      }
    });
  }


}
