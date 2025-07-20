import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ReviewService } from '../../../services/review.service';
import { Review, Pagination } from '../../../interfaces/review';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { environment } from '../../../../environments/environment';

const API_IMG = environment.apiUrlForImgs;

@Component({
  selector: 'app-pending',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterLinkActive],
  templateUrl: './pending.component.html'
})
export class PendingComponent implements OnInit {

  reviews: Review[] = [];
  pagination?: Pagination;
  searchControl = new FormControl('');
  isLoading = false;
  currentPage = 1;
  img_url = API_IMG;
  selectedReview: any = null;

  alert = {
    type: '',
    message: '',
    show: false
  };

  constructor(private reviewService: ReviewService) { }

  ngOnInit(): void {
    this.loadReviews();

    this.searchControl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => this.performSearch());
  }

  loadReviews(): void {
    this.isLoading = true;
    const page = this.currentPage;
    const limit = 10;

    this.reviewService.getPendingReviews(page, limit).subscribe({
      next: (res) => {
        
        if (res.success) {
          this.reviews = res.data;
          this.pagination = res.pagination;
          this.currentPage = this.pagination?.currentPage ?? 1;
        } else {
          this.showAlert('error', 'Failed to load pending reviews');
        }
      },
      error: (err) => {
        console.error('Error loading pending reviews:', err);
        this.showAlert('error', 'Error loading pending reviews');
      },
      complete: () => this.isLoading = false
    });
  }

  loadPage(page: number): void {
    if (!this.pagination) return;
    const totalPages = this.pagination.totalPages || 1;
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;

    this.isLoading = true;
    const limit = 10;
    const trimmedQuery = (this.searchControl.value ?? '').trim();

    this.reviewService.getPendingReviews(page, limit, trimmedQuery).subscribe({
      next: (res) => {
        if (res.success) {
          this.reviews = res.data;
          this.pagination = res.pagination;
          this.currentPage = this.pagination.currentPage;
        } else {
          this.showAlert('error', 'Failed to load page');
        }
      },
      error: () => this.showAlert('error', 'Error loading page'),
      complete: () => this.isLoading = false
    });
  }

  performSearch(): void {
    const trimmedQuery = (this.searchControl.value ?? '').trim();

    this.isLoading = true;
    const limit = 10;

    this.reviewService.getPendingReviews(this.currentPage, limit, trimmedQuery).subscribe({
      next: (res) => {
        if (res.success) {
          this.reviews = res.data;
          this.pagination = res.pagination;
          this.currentPage = this.pagination?.currentPage ?? 1;
        } else {
          this.showAlert('error', 'Search failed');
        }
      },
      error: (err) => {
        console.error('[API Error] Search failed:', err);
        this.showAlert('error', 'Search failed');
      },
      complete: () => this.isLoading = false
    });
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

  onViewReview(review: any) {
    this.selectedReview = review;
  }

  approveReview(review: Review): void {
    this.reviewService.updateReviewStatus(review.bookId, review.reviewId, true).subscribe({
      next: (res) => {
        if (res.success) {
          this.showAlert('success', 'Review approved successfully');
          this.loadReviews();
        } else {
          this.showAlert('error', 'Failed to approve review');
        }
      },
      error: () => this.showAlert('error', 'Error approving review')
    });
  }

  onPrepareDelete(review: Review): void {
    this.selectedReview = review;
  }

  confirmDelete(): void {
    if (!this.selectedReview) return;
    const { bookId, reviewId } = this.selectedReview;
  
    this.reviewService.deleteReview(bookId, reviewId).subscribe({
      next: (res) => {
        if (res.success) {
          this.showAlert('success', 'Review deleted successfully');
          this.loadReviews();
        } else {
          this.showAlert('error', 'Failed to delete review');
        }
      },
      error: () => this.showAlert('error', 'Error deleting review')
    });
  }
}
