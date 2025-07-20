import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, WishlistItem } from '../services/product.service';
import { Router } from '@angular/router';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css'],
})
export class WishlistComponent implements OnInit {
  wishlistItems: WishlistItem[] = [];
  selectedAction: string = '';
  allSelected: boolean = false;
  loading: boolean = true;
  error: string = '';

  showToastFlag: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' | 'info' | 'warning' = 'info';

  constructor(
    private productService: ProductService,
    private route: Router,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = '';

    this.productService.getWishlist().subscribe({
      next: (products: WishlistItem[]) => {
        this.wishlistItems = products;
        this.loading = false;
      },
      error: (error: any) => {
        this.error = 'Failed to load products. Please try again later.';
        this.loading = false;
      },
    });
  }

  toggleSelectAll(): void {
    this.allSelected = !this.allSelected;
    this.wishlistItems.forEach((item) => (item.selected = this.allSelected));
  }

  updateSelectAll(): void {
    this.allSelected = this.wishlistItems.every((item) => item.selected);
  }

  addToCart(item: WishlistItem): void {
    if (!item.inStock) {
      this.showToast(`${item.name} is currently out of stock.`, 'warning');
      return;
    }

    this.cartService.addToCart({ bookId: item.id, quantity: 1 }).subscribe({
      next: () => {
        this.showToast('Added to cart!', 'success');
        this.cartService.refreshCart();
      },
      error: (error) => {
        this.showToast(`Failed to add "${item.name}" to cart.`, 'error');
      },
    });
  }

  addSelectedToCart(): void {
    const selectedItems = this.wishlistItems.filter((item) => item.selected);

    if (selectedItems.length === 0) {
      this.showToast('Please select at least one item.', 'info');
      return;
    }

    selectedItems.forEach((item) => {
      if (!item.inStock) {
        this.showToast(`"${item.name}" is out of stock. Skipping.`, 'warning');
        return;
      }

      this.cartService.addToCart({ bookId: item.id, quantity: 1 }).subscribe({
        next: () => {
          this.showToast(`"${item.name}" added to cart!`, 'success');
          this.cartService.refreshCart();
        },
        error: (err) => {
          this.showToast(`Failed to add "${item.name}"`, 'error');
        },
      });
    });
  }

  applyAction(): void {
    if (this.selectedAction === 'addToCart') {
      this.addSelectedToCart();
    }
    this.selectedAction = '';
  }

  readMore(item: WishlistItem): void {
    this.route.navigate(['/product', item.id]);
  }

  retryLoading(): void {
    this.loadProducts();
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/images/placeholder.jpg';
  }

  deleteItem(item: WishlistItem): void {
    this.productService.removeFromWishlist(item.id).subscribe({
      next: () => {
        this.wishlistItems = this.wishlistItems.filter(
          (wishlistItem) => wishlistItem.id !== item.id
        );
        this.updateSelectAll();
        this.showToast(`"${item.name}" removed from wishlist.`, 'info');
      },
      error: (err) => {
        this.showToast('Failed to delete item.', 'error');
      },
    });
  }

  showToast(
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info'
  ): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToastFlag = true;

    setTimeout(() => {
      this.showToastFlag = false;
    }, 3000);
  }
}
