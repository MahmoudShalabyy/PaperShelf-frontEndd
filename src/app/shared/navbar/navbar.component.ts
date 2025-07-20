import { Component, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RoleService } from '../../services/role.service';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

declare var bootstrap: any;


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule , FormsModule ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  role: string | null = null;
  name: string | null = null;
  private userSub!: Subscription;
  getcart: any = { items: [], totalAmount: 0 };
  private cartSub!: Subscription;
  private cartInstance: any;
  imgBaseUrl = environment.apiUrlForImgs;
 
  @ViewChild('cartSidebar') cartSidebar!: ElementRef;

constructor(
    public linkserv: AuthService,
    private logoutserv: RoleService,
    private _roleser: RoleService,
    private _getcart: CartService,
    private router : Router
  ) {}
  private cartToggleSub!: Subscription;
  ngOnInit(): void {
    this.cartSub = this._getcart.cart$.subscribe(cart => {
      this.getcart = cart;
      this.updateCartTotal();
    });
    
    this._getcart.refreshCart();
    this.userSub = this._roleser.userChanged.subscribe(user => {
      if (user) {
        this.role = user.role;
        this.name = user.name;
      } else {
        this.role = null;
        this.name = null;
      }
    });

    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      this.role = user.role;
      this.name = user.name;
    }

    this.cartToggleSub = this._getcart.toggleCart$.subscribe(() => {
      this.toggleCart();
    });
    
  }
//   get isLoggedIn(): boolean {
//   return this._roleser.isLoggedIn();
// }

  toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    if (!cartSidebar) return;
    const offcanvas = bootstrap.Offcanvas.getInstance(cartSidebar) || new bootstrap.Offcanvas(cartSidebar);
    offcanvas.toggle();
  }

  ngOnDestroy(): void {
    if (this.cartToggleSub) {
      this.cartToggleSub.unsubscribe();
    }
  }

  increaseQuantity(cartItem: any) {
    if (cartItem.quantity < 10) {
      cartItem.quantity++;
      this.updateCartItem(cartItem);
    }
  }

  decreaseQuantity(cartItem: any) {
    if (cartItem.quantity > 1) {
      cartItem.quantity--;
      this.updateCartItem(cartItem);
    }
  }

  updateQuantity(cartItem: any, event: any) {
    let newQuantity = +event.target.value;
    if (newQuantity < 1) newQuantity = 1;
    else if (newQuantity > 10) newQuantity = 10;
    cartItem.quantity = newQuantity;
    event.target.value = newQuantity;
    this.updateCartItem(cartItem);
  }

  updateCartItem(cartItem: any) {
    this._getcart.updateCartItemQuantity(cartItem._id, cartItem.quantity).subscribe({
      next: () => {
        this.updateCartTotal();
        this._getcart.refreshCart();
      },
      error: (err) => {
        this._getcart.refreshCart();
      }
    });
  }

  updateCartTotal() {
    this.getcart.totalAmount = this.getcart.items.reduce(
      (sum: number, item: any) => sum + (item.priceAtTime * item.quantity),
      0
    );
    this.getcart = { ...this.getcart, items: [...this.getcart.items] };
  }

  deleteItem(itemId: string) {
    this._getcart.removeCartItem(itemId).subscribe({
      next: () => {
        this.getcart.items = this.getcart.items.filter((item: any) => item._id !== itemId);
        this._getcart.refreshCart();
      },
      error: (err) => {
      }
    });
  }
  logout() {
    this.logoutserv.logout();
  }
}
