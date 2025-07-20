import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';  

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.css'
})
export class OrderHistoryComponent implements OnInit {
  orders: any[] = [];
  loading = true;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchOrders();
  }

  fetchOrders() {
    this.http.get<any>(`${environment.apiBase}/orders`).subscribe({ 
      next: (res) => {
        this.orders = res.data.orders;
        this.loading = false;
      },
      error: (err) => {
        
        this.loading = false;
      }
    });
  }
}
