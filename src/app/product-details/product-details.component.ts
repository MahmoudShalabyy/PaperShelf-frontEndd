import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../services/cart.service';
import { ProductService } from '../services/product.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css'],
})
export class ProductDetailsComponent implements OnInit {
  product: any = {};
  selectedImage = '';
  tab: 'description' | 'info' | 'reviews' = 'description';
  quantity = 1;
  relatedProducts: any[] = [];
  isInWishlist = false;
  newReview = { rating: 5, comment: '' };
  userReviewSubmitted = false;
  hoveredStar = 0;
  toastMessage: string = '';
  toastClass: string = '';
  showToastFlag: boolean = false;
  environment = environment;

  //  AI Summary Variables
  aiSummary: string = '';
  fullAISummary: string = '';
  streamIndex = 0;
  streamTimer: any;
  isStreaming: boolean = false;
  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private productService: ProductService,
    private toastr: ToastrService,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadProductDetails(id);
      }

    });
  }


  loadProductDetails(id: string) {
    this.http
      .get(`${environment.apiBaseUrl}/books/${id}`)
      .subscribe((data: any) => {
        this.product = data.data.book;
        this.selectedImage = this.product.coverImage.startsWith('http')
          ? this.product.coverImage
          : `${environment.apiUrlForImgs}${this.product.coverImage}`;
        this.checkIfInWishlist(this.product._id);
        this.loadRelated(this.product.category);
        this.loadReviews();
        this.loadAISummary(id);
      });
  }

  checkIfInWishlist(productId: string) {
    this.http.get(`${environment.apiBase}/wishlist`).subscribe({
      next: (res: any) => {
        const wishlist = res.data || [];
        this.isInWishlist = wishlist.some((item: any) => item._id === productId);
      },
      error: (err) => {
        this.isInWishlist = false;
      },
    });
  }

  showToast(message: string, type: 'success' | 'danger') {
    this.toastMessage = message;
    this.toastClass = type === 'success' ? 'bg-success' : 'bg-danger';
    this.showToastFlag = true;

    setTimeout(() => {
      this.showToastFlag = false;
    }, 3000);
  }
  //  AI Summary Streaming
  loadAISummary(bookId: string) {
    this.productService.getAISummary(bookId).subscribe({
      next: (summary: string) => {
        if (!summary || summary.trim() === '') {
          this.aiSummary = '📘 AI Summary not available for this book.';
          return;
        }
        this.fullAISummary = summary;
        this.aiSummary = '';
        this.streamIndex = 0;
        this.startStreaming();
      },
      error: (err) => {
        this.aiSummary = '📘 AI Summary not available for this book.';
      },
    });
  }

  startStreaming() {
    if (this.streamTimer) clearInterval(this.streamTimer);
    this.streamTimer = setInterval(() => {
      if (this.streamIndex < this.fullAISummary.length) {
        this.aiSummary += this.fullAISummary[this.streamIndex];
        this.streamIndex++;
      } else {
        clearInterval(this.streamTimer);
      }
    }, 30); // Adjust speed as needed
  }


  addToWishlist() {
    this.productService.addToWishlist(this.product._id).subscribe({
      next: () => {
        this.showToast(`"${this.product.title}" added to wishlist!`, 'success');
        this.isInWishlist = true;
      },
      error: () => {
        this.toastr.error('Failed to add to wishlist!', 'Error');
      },
    });
  }

  addToCart() {
    const payload = {
      bookId: this.product._id,
      quantity: this.quantity
    };

    this.cartService.addToCart(payload).subscribe({
      next: (response) => {
        this.cartService.refreshCart();
        this.showToast(`"${this.product.title}" added to cart!`, 'success');
      },
      error: (error) => {
        this.showToast(
          error.error?.message || 'Failed to add to cart.',
          'danger'
        );
      },
    });
  }

  submitReview() {
    if (!this.newReview.rating || !this.newReview.comment.trim()) {
      this.showToast('Please provide both rating and comment.', 'danger');
      return;
    }

    const reviewPayload = {
      rating: this.newReview.rating,
      text: this.newReview.comment,
    };

    this.http
      .post(`${environment.apiBase}/reviews/${this.product._id}`, reviewPayload)
      .subscribe({
        next: () => {
          this.newReview = { rating: 0, comment: '' };
          this.userReviewSubmitted = true;
          this.showToast(
            'Review submitted and is pending approval.',
            'success'
          );
        },
        error: (err) => {
          this.showToast(err.error?.message || 'Submission failed.', 'danger');
        },
      });
  }

  loadReviews() {
    this.http
      .get(`${environment.apiBase}/reviews/${this.product._id}`)
      .subscribe((res: any) => {
        this.product.reviews = Array.isArray(res.data) ? res.data : [];
      });
  }

  loadRelated(category: string) {
    this.http
      .get(`${environment.apiBaseUrl}/books?category=${category}&limit=4`)
      .subscribe((res: any) => {
        if (Array.isArray(res.data.books)) {
          this.relatedProducts = res.data.books.filter(
            (p: any) => p._id !== this.product._id
          );
        } else {
          this.relatedProducts = [];
        }
      });
  }
}
