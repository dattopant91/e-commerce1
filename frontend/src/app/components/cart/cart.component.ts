import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CartService, CartItem } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TableModule, RouterModule],
  template: `
    <div style="max-width: 800px; margin: 2rem auto; padding: 0 1rem;">
      <p-card header="Shopping Cart" styleClass="glass-card">
        <div *ngIf="items.length === 0" style="text-align: center; padding: 2rem;">
          <p style="color: #94a3b8;">Your cart is empty.</p>
          <button pButton label="Back to Dashboard" routerLink="/" class="p-button-cyan p-button-outlined"></button>
        </div>
        <div *ngIf="items.length > 0">
          <p-table [value]="items">
            <ng-template pTemplate="header">
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-item>
              <tr>
                <td>{{ item.product.name }}</td>
                <td>{{ item.product.price | currency }}</td>
                <td>{{ item.quantity }}</td>
                <td>{{ (item.product.price * item.quantity) | currency }}</td>
              </tr>
            </ng-template>
          </p-table>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 2rem;">
            <h3>Total: {{ total | currency }}</h3>
            <div style="display: flex; gap: 1rem;">
              <button pButton label="Continue Shopping" routerLink="/" class="p-button-text p-button-cyan"></button>
              <button pButton label="Proceed to Checkout" (click)="proceedToCheckout()" class="p-button-cyan"></button>
            </div>
          </div>
        </div>
      </p-card>
    </div>
  `
})
export class CartComponent implements OnInit {
  items: CartItem[] = [];
  total = 0;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.items = this.cartService.getCartItems();
    this.total = this.cartService.getTotal();
  }

  proceedToCheckout() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/checkout']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
