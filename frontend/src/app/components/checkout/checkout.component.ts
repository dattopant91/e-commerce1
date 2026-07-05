import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, RouterModule, FormsModule],
  template: `
    <div class="checkout-outer-container">
      <p-card header="Delivery & Checkout" styleClass="glass-card">
        <p style="color: #94a3b8; margin-bottom: 2rem;">Review your items and shipping details before completing your order.</p>
        
        <!-- SECTION 1: ORDER SUMMARY (WITH REMOVE ACTION) -->
        <div class="checkout-section">
          <h3 class="section-title"><i class="pi pi-shopping-bag title-icon"></i> Order Summary</h3>
          
          <div *ngIf="cartItems.length === 0" class="empty-state">
            <i class="pi pi-shopping-cart empty-icon"></i>
            <p>Your cart is empty. Add some products to place an order.</p>
            <button pButton label="Go to Products Catalog" routerLink="/" class="p-button-cyan p-button-outlined mt-3"></button>
          </div>

          <div *ngIf="cartItems.length > 0" class="items-list">
            <div class="checkout-item" *ngFor="let item of cartItems">
              <div class="item-left">
                <img [src]="item.product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'" class="item-img" alt="product" />
                <div class="item-info">
                  <h4 class="item-name">{{ item.product.name }}</h4>
                  <span class="item-price">{{ item.product.price | currency }}</span>
                  <span class="item-qty">Qty: {{ item.quantity }}</span>
                </div>
              </div>
              <div class="item-right">
                <span class="item-subtotal">{{ (item.product.price * item.quantity) | currency }}</span>
                <button pButton icon="pi pi-trash" class="p-button-danger p-button-text p-button-rounded remove-btn" (click)="removeItem(item.product.id)" title="Remove item"></button>
              </div>
            </div>

            <!-- TOTAL SUMMARY BLOCK -->
            <div class="total-block">
              <span class="total-label">Subtotal:</span>
              <span class="total-val">{{ total | currency }}</span>
            </div>
          </div>
        </div>

        <!-- SECTION 2: SHIPPING ADDRESS -->
        <div class="checkout-section border-top">
          <h3 class="section-title"><i class="pi pi-map-marker title-icon"></i> Shipping Address</h3>
          <textarea 
            [(ngModel)]="address" 
            rows="3" 
            class="custom-textarea" 
            placeholder="Type your complete delivery address here..."
          ></textarea>
        </div>

        <!-- FOOTER ACTIONS -->
        <div class="action-footer">
          <button pButton label="Back to Cart" routerLink="/cart" class="p-button-text p-button-secondary"></button>
          <button pButton label="Proceed to Payment" (click)="proceedToPayment()" [disabled]="!address.trim() || cartItems.length === 0" class="p-button-cyan"></button>
        </div>
      </p-card>
    </div>
  `,
  styles: [`
    .checkout-outer-container {
      max-width: 700px;
      margin: 3rem auto;
      padding: 0 1.5rem;
    }

    ::ng-deep .glass-card {
      background: rgba(30, 41, 59, 0.45) !important;
      backdrop-filter: blur(20px) !important;
      -webkit-backdrop-filter: blur(20px) !important;
      border: 1px solid rgba(255, 255, 255, 0.08) !important;
      border-radius: 16px !important;
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5) !important;
    }

    .checkout-section {
      margin-bottom: 2rem;
    }

    .border-top {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 1.5rem;
    }

    .section-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #f8fafc;
      margin: 0 0 1.25rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .title-icon {
      color: #06b6d4;
    }

    /* Checkout Items Layout */
    .items-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      background: rgba(15, 23, 42, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 1.25rem;
    }

    .checkout-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .checkout-item:last-child {
      padding-bottom: 0;
      border-bottom: none;
    }

    .item-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .item-img {
      width: 54px;
      height: 54px;
      object-fit: cover;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .item-info {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .item-name {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 600;
      color: #f8fafc;
    }

    .item-price {
      font-size: 0.85rem;
      color: #94a3b8;
    }

    .item-qty {
      font-size: 0.8rem;
      color: #64748b;
    }

    .item-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .item-subtotal {
      font-weight: 600;
      color: #f8fafc;
      font-size: 0.95rem;
    }

    ::ng-deep .remove-btn {
      color: #f87171 !important;
      padding: 0.25rem !important;
      transition: all 0.2s;
    }

    ::ng-deep .remove-btn:hover {
      background: rgba(239, 68, 68, 0.1) !important;
      transform: scale(1.1);
    }

    /* Total Summary Block */
    .total-block {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 1rem;
      margin-top: 0.5rem;
      font-size: 1.1rem;
      font-weight: 700;
    }

    .total-label {
      color: #cbd5e1;
    }

    .total-val {
      color: #22d3ee;
    }

    /* Address Textarea */
    .custom-textarea {
      width: 100%;
      background: rgba(15, 23, 42, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #f8fafc;
      border-radius: 8px;
      padding: 0.85rem;
      font-family: inherit;
      font-size: 0.95rem;
      resize: none;
      outline: none;
      transition: border-color 0.3s;
    }

    .custom-textarea:focus {
      border-color: #06b6d4;
      box-shadow: 0 0 10px rgba(6, 182, 212, 0.2);
    }

    /* Empty state */
    .empty-state {
      text-align: center;
      padding: 2.5rem 1rem;
      color: #64748b;
      border: 1px dashed rgba(255, 255, 255, 0.08);
      border-radius: 12px;
    }

    .empty-icon {
      font-size: 2.5rem;
      color: #475569;
      margin-bottom: 0.75rem;
    }

    .mt-3 {
      margin-top: 1rem;
    }

    /* Footer buttons */
    .action-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 1.5rem;
    }

    .p-button-cyan {
      background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%) !important;
      border: none !important;
      color: #ffffff !important;
      font-weight: 600 !important;
      padding: 0.65rem 1.75rem !important;
      border-radius: 8px !important;
    }

    .p-button-cyan:hover {
      background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%) !important;
    }

    .p-button-cyan[disabled] {
      opacity: 0.5 !important;
      background: #475569 !important;
      cursor: not-allowed !important;
    }

    .p-button-cyan.p-button-outlined {
      background: transparent !important;
      border: 1px solid #06b6d4 !important;
      color: #06b6d4 !important;
    }
  `]
})
export class CheckoutComponent implements OnInit {
  address: string = '123 Tech Lane, Silicon Valley, CA';
  cartItems: CartItem[] = [];
  total: number = 0;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cartService: CartService
  ) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    const saved = sessionStorage.getItem('shippingAddress');
    if (saved) {
      this.address = saved;
    }

    // Subscribe to cart changes
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      this.total = this.cartService.getTotal();
    });
  }

  removeItem(productId: number | undefined) {
    if (productId) {
      this.cartService.removeFromCart(productId);
    }
  }

  proceedToPayment() {
    sessionStorage.setItem('shippingAddress', this.address);
    this.router.navigate(['/payment']);
  }
}
