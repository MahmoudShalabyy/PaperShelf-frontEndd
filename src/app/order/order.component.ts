import { Component, OnInit } from '@angular/core';
import { CartService } from '../services/cart.service';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormGroupDirective,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment'; 

declare const paypal: any;

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './order.component.html',
  styleUrl: './order.component.css',
})
export class OrderComponent implements OnInit {
  cartData: any = { items: [], totalAmount: 0 };
  checkoutForm: FormGroup;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';
  showToastFlag: boolean = false;
  environment = environment;

  constructor(
    private _cartService: CartService,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.checkoutForm = this.fb.group({
      shippingAddress: this.fb.group({
        firstName: [
          '',
          [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
        ],
        lastName: [
          '',
          [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
        ],
        email: ['', [Validators.required, Validators.email]],
        phone: [
          '',
          [Validators.required, Validators.minLength(10), Validators.maxLength(15)],
        ],
        address: [
          '',
          [Validators.required, Validators.minLength(10), Validators.maxLength(200)],
        ],
        city: [
          '',
          [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
        ],
        state: [
          '',
          [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
        ],
        country: [
          'Egypt',
          [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
        ],
      }),
      paymentMethod: ['cash_on_delivery', Validators.required],
      notes: [''],
    });
  }

  ngOnInit(): void {
    this._cartService.cart$.subscribe((cart) => (this.cartData = cart));
    this._cartService.refreshCart();
  }

  showToast(message: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToastFlag = true;
    setTimeout(() => {
      this.showToastFlag = false;
    }, 3000);
  }

  get shippingAddress(): FormGroup {
    return this.checkoutForm.get('shippingAddress') as FormGroup;
  }

  get selectedPaymentMethod(): string {
    return this.checkoutForm.get('paymentMethod')?.value;
  }

  onSubmit(): void {
    if (this.checkoutForm.invalid) {
      
      this.checkoutForm.markAllAsTouched();
      return;
    }

    const payload = this.checkoutForm.value;

    this.http.post(`${environment.apiBase}/checkout/process`, payload).subscribe({
      next: (response) => {
        
        this._cartService.refreshCart();
        this.showToast('Order placed successfully!', 'success');
      },
      error: (error) => {
        
        const serverError =
          error.error?.message || 'Failed to place order. Please try again.';
        this.showToast(serverError, 'error');
      },
    });
  }

  proceedToPayPal(): void {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      this.showToast('Please complete the required fields.', 'error');
      return;
    }

    const formValue = this.checkoutForm.value;
    const shipping = formValue.shippingAddress;
    const amount = this.cartData.totalAmount.toFixed(2);

    // Save order before payment
    this.http
      .post<{ orderId: string }>(`${environment.apiBase}/checkout/process`, formValue)
      .subscribe({
        next: (res) => {
          const createdOrderId = res.orderId;

          // Create PayPal order
          this.http
            .post<{ id: string }>(`${environment.apiBase}/paypal/create-order`, { amount })
            .subscribe({
              next: (paypalRes) => {
                const paypalOrderId = paypalRes.id;

                const container = document.querySelector('.paypal-btn-container');
                if (container) container.innerHTML = '';

                // Render PayPal buttons
                paypal
                  .Buttons({
                    createOrder: () => paypalOrderId,
                    onApprove: () => {
                      this.http
                        .post(
                          `${environment.apiBase}/paypal/capture-order/${paypalOrderId}`,
                          { orderID: paypalOrderId }
                        )
                        .subscribe({
                          next: () => {
                            const confirmPayload = {
                              orderId: createdOrderId,
                              paymentMethod: 'paypal',
                              paymentDetails: {
                                paypalId: paypalOrderId,
                              },
                            };

                            this.http
                              .post(`${environment.apiBase}/checkout/payment`, confirmPayload)
                              .subscribe({
                                next: () => {
                                  this._cartService.refreshCart();
                                  this.showToast('Order placed successfully!', 'success');
                                },
                                error: (err) => {
                                  
                                  this.showToast('Error processing order', 'error');
                                },
                              });
                          },
                          error: (err) => {
                            
                            this.showToast('PayPal payment capture failed', 'error');
                          },
                        });
                    },
                    onCancel: () => {
                      this.showToast('Payment cancelled', 'error');
                    },
                    onError: (err: any) => {
                      this.showToast('Payment error occurred', 'error');
                      
                    },
                  })
                  .render('.paypal-btn-container');
              },
              error: (err) => {
                
                alert('Error initiating PayPal payment');
              },
            });
        },
        error: (err) => {
          
          this.showToast('Please check your shipping info before proceeding to PayPal.', 'error');
        },
      });
  }
}
