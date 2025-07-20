import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { Book } from '../../interfaces/book';
import { take } from 'rxjs';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './book-card.component.html',
  styleUrls: ['./book-card.component.css'],
})
export class BookCardComponent {
  @Input() book!: Book;
  message: string = '';
  messageColor: 'success' | 'error' = 'success';
  @Input() wishlistIds: string[] = [];

  get isInWishlist(): boolean {
    return this.wishlistIds.includes(this.book.id);
  }
  constructor(
    private cartService: CartService,
    private productService: ProductService
  ) { }

  addToCart() {
    this.cartService.cart$.pipe(take(1)).subscribe((cart) => {
      const totalItems = cart.items.reduce(
        (acc: number, item: { quantity: number }) => acc + item.quantity,
        0
      );

      if (totalItems >= 10) {
        this.showMessage(
          'You cannot add more than 10 products to the cart.',
          'error'
        );
        return;
      }

      if (this.book.stock <= 0) {
        this.showMessage('This book is out of stock.', 'error');
        return;
      }

      this.cartService
        .addToCart({ bookId: this.book.id, quantity: 1 })
        .subscribe({
          next: () => {
            this.cartService.refreshCart();
            this.cartService.toggleCart();
            this.showMessage('Your Product added Successfuly', 'success');
          },
          error: (error) => {
            const message =
              error?.error?.message || 'faild to updated in card.';
            this.showMessage(message, 'error');
          },
        });
    });
  }

  showMessage(msg: string, type: 'success' | 'error') {
    this.message = msg;
    this.messageColor = type;
    setTimeout(() => {
      this.message = '';
    }, 4000); 
  }

  addToWishlist() {
    this.productService.addToWishlist(this.book.id).subscribe({
      next: () => {
        this.showMessage(`"${this.book.title}" added to wishlist!`, 'success');
        this.wishlistIds.push(this.book.id);
      },
      error: (err) => {
        const message = err.error?.message || 'Failed to add to wishlist.';
        this.showMessage(message, 'error');
      },
    });
  }

  getDiscountedPrice(price: number, discount: number): number {
    return price - (price * discount) / 100;
  }
}
