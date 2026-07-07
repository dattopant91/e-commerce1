import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CartService, CartItem } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TableModule, RouterModule],
  template: `
    <div class="cart-outer-container animate-fade-in">
      <p-card header="Shopping Cart" styleClass="glass-card">
        <!-- EMPTY CART STATE -->
        <div *ngIf="items.length === 0" class="empty-state-box">
          <i class="pi pi-shopping-cart empty-cart-icon"></i>
          <h2>Your cart is empty</h2>
          <p>Explore our premium collections and add items to get started.</p>
          <button pButton label="Start Shopping" routerLink="/" class="p-button-cyan mt-4"></button>
        </div>

        <!-- ACTIVE CART LIST -->
        <div *ngIf="items.length > 0">
          <!-- Desktop Table Layout -->
          <div class="table-wrapper hide-on-mobile">
            <p-table [value]="items" class="custom-table" [responsiveLayout]="'scroll'">
              <ng-template pTemplate="header">
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th style="width: 150px; text-align: center;">Quantity</th>
                  <th>Total</th>
                  <th style="width: 80px; text-align: center;">Actions</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-item>
                <tr>
                  <td>
                    <div class="product-cell">
                      <img [src]="item.product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'" class="product-thumb" alt="product" />
                      <span class="product-name">{{ item.product.name }}</span>
                    </div>
                  </td>
                  <td>{{ item.product.price | currency }}</td>
                  <td>
                    <div class="qty-control">
                      <button pButton icon="pi pi-minus" class="p-button-text p-button-sm qty-btn" (click)="decreaseQty(item)" [disabled]="item.quantity <= 1"></button>
                      <span class="qty-number">{{ item.quantity }}</span>
                      <button pButton icon="pi pi-plus" class="p-button-text p-button-sm qty-btn" (click)="increaseQty(item)"></button>
                    </div>
                  </td>
                  <td class="item-total">{{ (item.product.price * item.quantity) | currency }}</td>
                  <td style="text-align: center;">
                    <button pButton icon="pi pi-trash" class="p-button-danger p-button-text p-button-rounded remove-btn" (click)="removeItem(item.product.id)" title="Remove item"></button>
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </div>

          <!-- Mobile Cards Layout -->
          <div class="mobile-cart-list show-on-mobile">
            <div class="mobile-cart-item glass-card" *ngFor="let item of items">
              <div class="item-product-info">
                <img [src]="item.product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'" class="product-thumb" alt="product" />
                <div class="product-details">
                  <span class="product-name">{{ item.product.name }}</span>
                  <span class="product-price">{{ item.product.price | currency }}</span>
                </div>
                <button pButton icon="pi pi-trash" class="p-button-danger p-button-text p-button-rounded remove-btn" (click)="removeItem(item.product.id)"></button>
              </div>
              <div class="item-actions-row">
                <div class="qty-control">
                  <button pButton icon="pi pi-minus" class="p-button-text p-button-sm qty-btn" (click)="decreaseQty(item)" [disabled]="item.quantity <= 1"></button>
                  <span class="qty-number">{{ item.quantity }}</span>
                  <button pButton icon="pi pi-plus" class="p-button-text p-button-sm qty-btn" (click)="increaseQty(item)"></button>
                </div>
                <span class="item-total">{{ (item.product.price * item.quantity) | currency }}</span>
              </div>
            </div>
          </div>

          <!-- FOOTER ACTIONS & CART TOTAL -->
          <div class="cart-footer">
            <div class="total-summary">
              <span class="total-label">Total Amount:</span>
              <span class="total-value">{{ total | currency }}</span>
            </div>
            
            <div class="action-buttons">
              <button pButton label="Continue Shopping" routerLink="/" class="p-button-text p-button-cyan p-button-outlined"></button>
              <button pButton label="Proceed to Checkout" (click)="proceedToCheckout()" class="p-button-cyan"></button>
            </div>
          </div>
        </div>
      </p-card>
    </div>
  `,
  styles: [`
    .cart-outer-container {
      max-width: 950px;
      margin: 3rem auto;
      padding: 0 1.5rem;
    }

    ::ng-deep .glass-card {
      background: var(--card-bg) !important;
      backdrop-filter: blur(20px) !important;
      -webkit-backdrop-filter: blur(20px) !important;
      border: 1px solid var(--glass-border) !important;
      border-radius: 16px !important;
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5) !important;
      color: var(--text-color) !important;
    }

    ::ng-deep .glass-card .p-card-title {
      color: var(--text-highlight) !important;
    }

    /* Empty Cart State */
    .empty-state-box {
      text-align: center;
      padding: 4rem 2rem;
    }

    .empty-cart-icon {
      font-size: 4rem;
      color: var(--text-muted);
      margin-bottom: 1.5rem;
    }

    .empty-state-box h2 {
      font-size: 1.6rem;
      font-weight: 700;
      color: var(--text-highlight);
      margin: 0 0 0.5rem 0;
    }

    .empty-state-box p {
      color: var(--text-muted);
      font-size: 1rem;
      margin: 0;
    }

    .mt-4 {
      margin-top: 1.5rem;
    }

    /* Desktop View vs Mobile View selectors */
    .hide-on-mobile {
      display: block;
    }
    
    .show-on-mobile {
      display: none;
    }

    /* Table custom styles */
    .table-wrapper {
      background: var(--panel-bg);
      border: 1px solid var(--glass-border);
      border-radius: 12px;
      overflow: hidden;
    }

    ::ng-deep .custom-table .p-datatable-thead > tr > th {
      background: var(--panel-bg) !important;
      color: var(--text-muted) !important;
      border-color: var(--glass-border) !important;
      font-size: 0.85rem !important;
      font-weight: 600 !important;
      padding: 1rem !important;
    }

    ::ng-deep .custom-table .p-datatable-tbody > tr {
      background: transparent !important;
      color: var(--text-color) !important;
    }

    ::ng-deep .custom-table .p-datatable-tbody > tr > td {
      border-color: var(--glass-border) !important;
      padding: 1.25rem 1rem !important;
      vertical-align: middle;
      color: var(--text-color) !important;
    }

    .product-cell {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .product-thumb {
      width: 50px;
      height: 50px;
      object-fit: cover;
      border-radius: 6px;
      border: 1px solid var(--glass-border);
    }

    .product-name {
      font-weight: 600;
      color: var(--text-color);
    }

    .item-total {
      font-weight: 600;
      color: var(--text-color);
    }

    /* Quantity Control Styles */
    .qty-control {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      background: var(--input-bg);
      border: 1px solid var(--input-border);
      border-radius: 20px;
      padding: 0.25rem 0.5rem;
      width: fit-content;
      margin: 0 auto;
    }

    ::ng-deep .qty-btn {
      color: var(--neon-cyan) !important;
      padding: 0.25rem !important;
      width: 24px !important;
      height: 24px !important;
      border-radius: 50% !important;
      transition: background 0.2s;
    }

    ::ng-deep .qty-btn:hover:not([disabled]) {
      background: rgba(6, 182, 212, 0.1) !important;
    }

    ::ng-deep .qty-btn[disabled] {
      opacity: 0.3 !important;
      color: var(--text-muted) !important;
    }

    .qty-number {
      font-weight: 700;
      font-size: 0.95rem;
      color: var(--text-color);
      min-width: 1.5rem;
      text-align: center;
    }

    /* Remove Button */
    ::ng-deep .remove-btn {
      color: #f87171 !important;
      padding: 0.25rem !important;
      transition: all 0.2s;
    }

    ::ng-deep .remove-btn:hover {
      background: rgba(239, 68, 68, 0.1) !important;
      transform: scale(1.1);
    }

    /* Footer total and buttons */
    .cart-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 2.5rem;
      border-top: 1px solid var(--glass-border);
      padding-top: 1.5rem;
    }

    @media (max-width: 768px) {
      .hide-on-mobile {
        display: none !important;
      }
      
      .show-on-mobile {
        display: flex !important;
        flex-direction: column;
        gap: 1rem;
      }

      .mobile-cart-item {
        background: var(--panel-bg);
        border: 1px solid var(--glass-border);
        border-radius: 12px;
        padding: 1rem;
      }

      .item-product-info {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        position: relative;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid var(--glass-border);
      }

      .product-details {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        flex: 1;
      }

      .product-price {
        font-size: 0.85rem;
        color: var(--text-muted);
      }

      .item-product-info .remove-btn {
        position: absolute;
        right: -0.5rem;
        top: -0.25rem;
      }

      .item-actions-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 0.75rem;
      }

      .cart-footer {
        flex-direction: column;
        gap: 1.5rem;
        align-items: stretch;
      }
      .total-summary {
        justify-content: space-between;
      }
      .action-buttons {
        justify-content: space-between;
      }
    }

    .total-summary {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .total-label {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-muted);
    }

    .total-value {
      font-size: 1.6rem;
      font-weight: 800;
      color: #22d3ee;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
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

    .p-button-cyan.p-button-outlined {
      background: transparent !important;
      border: 1px solid #06b6d4 !important;
      color: #06b6d4 !important;
    }

    .animate-fade-in {
      animation: fadeIn 0.4s ease-out forwards;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class CartComponent implements OnInit, OnDestroy {
  items: CartItem[] = [];
  total = 0;
  private cartSub!: Subscription;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Reactive subscription to support live updating on increase/decrease/remove
    this.cartSub = this.cartService.cart$.subscribe(items => {
      this.items = items;
      this.total = this.cartService.getTotal();
    });
  }

  ngOnDestroy() {
    if (this.cartSub) {
      this.cartSub.unsubscribe();
    }
  }

  increaseQty(item: CartItem) {
    if (item.product.id) {
      this.cartService.updateQuantity(item.product.id, item.quantity + 1);
    }
  }

  decreaseQty(item: CartItem) {
    if (item.product.id && item.quantity > 1) {
      this.cartService.updateQuantity(item.product.id, item.quantity - 1);
    }
  }

  removeItem(productId: number | undefined) {
    if (productId) {
      this.cartService.removeFromCart(productId);
    }
  }

  proceedToCheckout() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/checkout']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
