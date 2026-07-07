import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ButtonModule, RouterModule, FormsModule],
  template: `
    <div class="checkout-split-container animate-fade-in">
      <!-- LEFT PANEL: CLIENT FORMS -->
      <div class="left-form-panel">
        <div class="checkout-logo" routerLink="/">Sandy Cart</div>
        
        <!-- CONTACT SECTION -->
        <div class="checkout-form-section">
          <div class="section-header">
            <h2>Contact</h2>
            <a class="signin-link" *ngIf="!authService.isLoggedIn()" routerLink="/login">Sign in</a>
          </div>
          <div class="form-field">
            <input type="text" class="shopify-input" placeholder="Email or mobile phone number" [(ngModel)]="emailOrPhone" />
          </div>
        </div>

        <!-- DELIVERY SECTION -->
        <div class="checkout-form-section mt-6">
          <h2>Delivery</h2>
          
          <div class="form-field">
            <select class="shopify-select" [(ngModel)]="country">
              <option value="India">India</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
            </select>
          </div>

          <div class="form-row-2">
            <div class="form-field">
              <input type="text" class="shopify-input" placeholder="First name (optional)" [(ngModel)]="firstName" />
            </div>
            <div class="form-field">
              <input type="text" class="shopify-input" placeholder="Last name" [(ngModel)]="lastName" />
            </div>
          </div>

          <div class="form-field has-search">
            <i class="pi pi-search search-input-icon"></i>
            <input type="text" class="shopify-input pl-10" placeholder="Address" [(ngModel)]="addressLine1" />
          </div>

          <div class="form-field">
            <input type="text" class="shopify-input" placeholder="Apartment, suite, etc. (optional)" [(ngModel)]="addressLine2" />
          </div>

          <div class="form-row-3">
            <div class="form-field">
              <input type="text" class="shopify-input" placeholder="City" [(ngModel)]="city" />
            </div>
            <div class="form-field">
              <select class="shopify-select" [(ngModel)]="state">
                <option value="Maharashtra">Maharashtra</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Delhi">Delhi</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
              </select>
            </div>
            <div class="form-field">
              <input type="text" class="shopify-input" placeholder="PIN code" [(ngModel)]="pinCode" />
            </div>
          </div>

          <div class="checkbox-row mt-4">
            <input type="checkbox" id="saveInfo" [(ngModel)]="saveInfo" />
            <label for="saveInfo">Save this information for next time</label>
          </div>
        </div>

        <!-- SHIPPING METHOD SECTION -->
        <div class="checkout-form-section mt-8">
          <h2>Shipping method</h2>
          <div class="shipping-placeholder-box">
            <span *ngIf="!addressLine1.trim()">Enter your shipping address to view available shipping methods.</span>
            <div class="shipping-rate-row" *ngIf="addressLine1.trim()">
              <div class="rate-left">
                <i class="pi pi-truck"></i>
                <span class="rate-name">Standard Delivery (Home/Office)</span>
              </div>
              <span class="rate-price">FREE</span>
            </div>
          </div>
        </div>

        <!-- BOTTOM NAVIGATION -->
        <div class="navigation-footer mt-8">
          <a routerLink="/cart" class="back-link"><i class="pi pi-angle-left"></i> Return to cart</a>
          <button pButton label="Proceed to Payment" (click)="proceedToPayment()" [disabled]="!isFormValid()" class="p-button-cyan-shopify"></button>
        </div>
      </div>

      <!-- RIGHT PANEL: CART SUMMARY (GREY BG) -->
      <div class="right-summary-panel">
        <div class="summary-content">
          <div class="summary-items-list">
            <div class="summary-item" *ngFor="let item of cartItems">
              <div class="item-left">
                <div class="image-wrapper">
                  <img [src]="item.product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'" alt="product" />
                  <span class="badge">{{ item.quantity }}</span>
                </div>
                <span class="item-name">{{ item.product.name }}</span>
              </div>
              <span class="item-price">{{ (item.product.price * item.quantity) | currency:'INR':'symbol':'1.2-2' }}</span>
            </div>
          </div>

          <!-- PRICING SUMMARY -->
          <div class="pricing-summary-block mt-6">
            <div class="pricing-row">
              <span>Subtotal</span>
              <span class="val">{{ total | currency:'INR':'symbol':'1.2-2' }}</span>
            </div>
            <div class="pricing-row mt-2">
              <span>Shipping</span>
              <span class="val text-muted">{{ addressLine1.trim() ? 'FREE' : 'Enter shipping address' }}</span>
            </div>
            <div class="pricing-total-row mt-4">
              <span>Total</span>
              <span class="val-large"><small>INR</small> {{ total | currency:'INR':'symbol':'1.2-2' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .checkout-split-container {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      min-height: 100vh;
      background: var(--bg-gradient);
    }

    @media (max-width: 992px) {
      .checkout-split-container {
        grid-template-columns: 1fr;
      }
      .right-summary-panel {
        order: -1;
        min-height: auto !important;
        border-left: none !important;
        border-bottom: 1px solid var(--glass-border);
        padding: 2rem 1.5rem !important;
      }
      .left-form-panel {
        padding: 2rem 1.5rem !important;
      }
    }

    /* Left Form Panel styles */
    .left-form-panel {
      padding: 4rem 4rem 4rem 10%;
      background: var(--card-bg);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      display: flex;
      flex-direction: column;
      max-width: 750px;
      justify-self: end;
      width: 100%;
      box-sizing: border-box;
    }

    .checkout-logo {
      font-size: 1.8rem;
      font-weight: 800;
      color: var(--text-highlight);
      cursor: pointer;
      margin-bottom: 2rem;
      letter-spacing: -0.02em;
    }

    .checkout-form-section h2 {
      font-size: 1.3rem;
      font-weight: 700;
      color: var(--text-highlight);
      margin: 0 0 1rem 0;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .section-header h2 {
      margin: 0;
    }

    .signin-link {
      color: #06b6d4;
      font-size: 0.9rem;
      text-decoration: none;
      font-weight: 500;
    }

    .signin-link:hover {
      text-decoration: underline;
    }

    /* Shopify Custom Inputs */
    .form-field {
      margin-bottom: 0.85rem;
      position: relative;
    }

    .shopify-input {
      width: 100%;
      background: var(--input-bg);
      border: 1px solid var(--input-border);
      color: var(--input-color);
      border-radius: 5px;
      padding: 0.85rem 1rem;
      font-size: 0.95rem;
      box-sizing: border-box;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .shopify-input:focus {
      border-color: #06b6d4;
      box-shadow: 0 0 0 1px #06b6d4;
    }

    .shopify-select {
      width: 100%;
      background: var(--input-bg);
      border: 1px solid var(--input-border);
      color: var(--input-color);
      border-radius: 5px;
      padding: 0.85rem 1rem;
      font-size: 0.95rem;
      box-sizing: border-box;
      outline: none;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 1rem center;
      background-size: 1rem;
    }

    body.light-theme .shopify-select {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgba(15,23,42,0.6)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    }

    .shopify-select:focus {
      border-color: #06b6d4;
    }

    .form-row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.85rem;
    }

    .form-row-3 {
      display: grid;
      grid-template-columns: 1fr 1.2fr 1fr;
      gap: 0.85rem;
    }

    .has-search {
      position: relative;
    }

    .search-input-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      font-size: 1rem;
    }

    .pl-10 {
      padding-left: 2.75rem !important;
    }

    .checkbox-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: var(--text-muted);
      cursor: pointer;
    }

    .checkbox-row input {
      cursor: pointer;
    }

    /* Shipping Method Box */
    .shipping-placeholder-box {
      background: var(--panel-bg);
      border: 1px solid var(--glass-border);
      border-radius: 6px;
      padding: 1.25rem;
      color: var(--text-muted);
      font-size: 0.9rem;
      text-align: center;
    }

    .shipping-rate-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: var(--text-color);
      font-weight: 500;
    }

    .rate-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .rate-left i {
      color: #06b6d4;
    }

    .rate-price {
      color: #34d399;
      font-weight: 700;
    }

    /* Navigation Footer */
    .navigation-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid var(--glass-border);
      padding-top: 1.5rem;
    }

    .back-link {
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-weight: 500;
    }

    .back-link:hover {
      color: #06b6d4;
    }

    .p-button-cyan-shopify {
      background: #06b6d4 !important;
      border: none !important;
      color: #ffffff !important;
      font-weight: 600 !important;
      padding: 1rem 2rem !important;
      border-radius: 5px !important;
      font-size: 1rem !important;
      transition: opacity 0.2s;
    }

    .p-button-cyan-shopify:hover {
      opacity: 0.9;
    }

    .p-button-cyan-shopify[disabled] {
      background: #475569 !important;
      opacity: 0.5 !important;
      cursor: not-allowed !important;
    }

    /* Right Summary Panel styles */
    .right-summary-panel {
      padding: 4rem 10% 4rem 4rem;
      background: var(--panel-bg);
      border-left: 1px solid var(--glass-border);
      min-height: 100vh;
      box-sizing: border-box;
    }

    .summary-content {
      max-width: 500px;
      width: 100%;
    }

    .summary-items-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      border-bottom: 1px solid var(--glass-border);
      padding-bottom: 1.5rem;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .item-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .image-wrapper {
      position: relative;
      width: 64px;
      height: 64px;
      border-radius: 8px;
      border: 1px solid var(--glass-border);
      background: #ffffff;
      overflow: visible;
    }

    .image-wrapper img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 8px;
    }

    .image-wrapper .badge {
      position: absolute;
      top: -8px;
      right: -8px;
      background: #4b5563;
      color: #ffffff;
      font-size: 0.75rem;
      font-weight: 700;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(255,255,255,0.1);
    }

    .item-name {
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--text-color);
      max-width: 250px;
      line-height: 1.4;
    }

    .item-price {
      font-weight: 600;
      font-size: 0.95rem;
      color: var(--text-highlight);
    }

    /* Pricing Summary Block */
    .pricing-summary-block {
      border-bottom: 1px solid var(--glass-border);
      padding-bottom: 1.5rem;
    }

    .pricing-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
      color: var(--text-muted);
    }

    .pricing-row .val {
      color: var(--text-highlight);
      font-weight: 600;
    }

    .pricing-total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-highlight);
    }

    .val-large {
      font-size: 1.5rem;
    }

    .val-large small {
      font-size: 0.8rem;
      color: var(--text-muted);
      font-weight: normal;
    }

    .mt-6 { margin-top: 1.5rem; }
    .mt-8 { margin-top: 2rem; }
    .pl-10 { padding-left: 2.5rem !important; }
  `]
})
export class CheckoutComponent implements OnInit {
  emailOrPhone: string = '';
  firstName: string = '';
  lastName: string = '';
  addressLine1: string = '';
  addressLine2: string = '';
  city: string = '';
  state: string = 'Maharashtra';
  pinCode: string = '';
  country: string = 'India';
  saveInfo: boolean = false;

  cartItems: CartItem[] = [];
  total: number = 0;

  constructor(
    public authService: AuthService,
    private router: Router,
    private cartService: CartService
  ) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    
    // Load customer email if available
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      this.emailOrPhone = user.email || user.username || '';
    }

    // Subscribe to cart changes
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      this.total = this.cartService.getTotal();
    });
  }

  isFormValid(): boolean {
    return (
      this.emailOrPhone.trim().length > 0 &&
      this.lastName.trim().length > 0 &&
      this.addressLine1.trim().length > 0 &&
      this.city.trim().length > 0 &&
      this.pinCode.trim().length > 0
    );
  }

  getCompiledAddress(): string {
    const fullName = `${this.firstName} ${this.lastName}`.trim();
    const l2 = this.addressLine2 ? `, ${this.addressLine2}` : '';
    return `${fullName}\n${this.addressLine1}${l2}\n${this.city}, ${this.state} - ${this.pinCode}\n${this.country}`;
  }

  proceedToPayment() {
    sessionStorage.setItem('shippingAddress', this.getCompiledAddress());
    this.router.navigate(['/payment']);
  }
}
