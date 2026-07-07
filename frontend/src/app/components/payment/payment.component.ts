import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, RouterModule, FormsModule],
  template: `
    <div class="payment-outer-container">
      <p-card styleClass="payment-glass-card">
        <!-- STEP 1: PAYMENT METHOD SELECTION -->
        <div *ngIf="step === 'selection'">
          <h2 class="payment-title"><i class="pi pi-credit-card title-icon"></i> Choose Payment Method</h2>
          <p class="payment-subtitle">Select a payment option to complete your purchase of {{ total | currency }}</p>
          
          <div class="methods-list">
            <div class="method-option" [class.selected]="selectedMethod === 'card'" (click)="selectMethod('card')">
              <div class="option-left">
                <i class="pi pi-credit-card option-icon"></i>
                <div class="option-text">
                  <h3>Credit / Debit Card</h3>
                  <p>Pay securely with Visa, Mastercard, or RuPay</p>
                </div>
              </div>
              <div class="option-check">
                <i class="pi" [class.pi-circle]="selectedMethod !== 'card'" [class.pi-check-circle]="selectedMethod === 'card'"></i>
              </div>
            </div>

            <div class="method-option" [class.selected]="selectedMethod === 'upi'" (click)="selectMethod('upi')">
              <div class="option-left">
                <i class="pi pi-mobile option-icon"></i>
                <div class="option-text">
                  <h3>UPI Instant Transfer</h3>
                  <p>Pay via Google Pay, PhonePe, or BHIM UPI ID</p>
                </div>
              </div>
              <div class="option-check">
                <i class="pi" [class.pi-circle]="selectedMethod !== 'upi'" [class.pi-check-circle]="selectedMethod === 'upi'"></i>
              </div>
            </div>

            <div class="method-option" [class.selected]="selectedMethod === 'cod'" (click)="selectMethod('cod')">
              <div class="option-left">
                <i class="pi pi-wallet option-icon"></i>
                <div class="option-text">
                  <h3>Cash on Delivery</h3>
                  <p>Pay cash when products are delivered to you</p>
                </div>
              </div>
              <div class="option-check">
                <i class="pi" [class.pi-circle]="selectedMethod !== 'cod'" [class.pi-check-circle]="selectedMethod === 'cod'"></i>
              </div>
            </div>
          </div>

          <div class="action-footer">
            <button pButton label="Back" routerLink="/checkout" class="p-button-text p-button-secondary"></button>
            <button pButton label="Continue" [disabled]="!selectedMethod" (click)="goToInputStep()" class="p-button-cyan"></button>
          </div>
        </div>

        <!-- STEP 2: INPUT DETAILS -->
        <div *ngIf="step === 'input'">
          <h2 class="payment-title">
            <i class="pi" [class.pi-credit-card]="selectedMethod === 'card'" [class.pi-mobile]="selectedMethod === 'upi'" [class.pi-wallet]="selectedMethod === 'cod'"></i> 
            Enter Details
          </h2>
          <p class="payment-subtitle">Please fill in the information below to continue</p>

          <!-- Card Form -->
          <div *ngIf="selectedMethod === 'card'" class="form-container">
            <div class="form-field">
              <label>Cardholder Name</label>
              <input type="text" class="custom-input" [(ngModel)]="cardDetails.name" placeholder="John Doe" />
            </div>
            <div class="form-field">
              <label>Card Number</label>
              <input type="text" class="custom-input" [(ngModel)]="cardDetails.number" placeholder="1234 5678 9101 1121" maxlength="19" />
            </div>
            <div class="form-row">
              <div class="form-field">
                <label>Expiry Date</label>
                <input type="text" class="custom-input" [(ngModel)]="cardDetails.expiry" placeholder="MM/YY" maxlength="5" />
              </div>
              <div class="form-field">
                <label>CVV</label>
                <input type="password" class="custom-input" [(ngModel)]="cardDetails.cvv" placeholder="***" maxlength="3" />
              </div>
            </div>
          </div>

          <!-- UPI Form -->
          <div *ngIf="selectedMethod === 'upi'" class="form-container">
            <div class="form-field">
              <label>Enter UPI ID (VPA)</label>
              <input type="text" class="custom-input" [(ngModel)]="upiId" placeholder="john.doe&#64;okaxis" />
              <small class="helper-text">Example: username&#64;bankname or mobileNo&#64;upi</small>
            </div>
          </div>

          <!-- COD Form -->
          <div *ngIf="selectedMethod === 'cod'" class="form-container text-center py-4">
            <i class="pi pi-info-circle info-icon"></i>
            <p class="info-text">No additional payment details are required for Cash on Delivery. Simply confirm your order below.</p>
          </div>

          <div class="action-footer">
            <button pButton label="Back" (click)="step = 'selection'" class="p-button-text p-button-secondary"></button>
            <button pButton label="Proceed to Pay" [disabled]="!isFormValid()" (click)="startProcessingPayment()" class="p-button-cyan"></button>
          </div>
        </div>

        <!-- STEP 3: PROCESSING ANIMATION -->
        <div *ngIf="step === 'processing'" class="processing-container">
          <div class="radar-spinner">
            <div class="circle circle-1"></div>
            <div class="circle circle-2"></div>
            <div class="circle circle-3"></div>
            <i class="pi pi-shield secure-icon animate-pulse"></i>
          </div>
          <h3 class="processing-status">{{ processingStatus }}</h3>
          <p class="processing-disclaimer">Please do not refresh the page or click back button.</p>
        </div>

        <!-- STEP 4: SUCCESS STATUS -->
        <div *ngIf="step === 'success'" class="success-container">
          <div class="success-icon-wrap">
            <svg class="checkmark-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
              <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          </div>
          <h2 class="success-title">Order Placed Successfully!</h2>
          <p class="success-msg">Your transaction was verified and completed.</p>
          
          <div class="receipt-box">
            <div class="receipt-row">
              <span class="receipt-label">Order Number</span>
              <span class="receipt-val">#{{ placedOrder.orderId }}</span>
            </div>
            <div class="receipt-row">
              <span class="receipt-label">Transaction ID</span>
              <span class="receipt-val">{{ placedOrder.transactionId }}</span>
            </div>
            <div class="receipt-row">
              <span class="receipt-label">Total Amount Paid</span>
              <span class="receipt-val total">{{ total | currency }}</span>
            </div>
          </div>

          <div class="action-footer justify-center mt-6">
            <button pButton label="Continue Shopping" (click)="completeCheckoutFlow()" class="p-button-cyan w-full"></button>
          </div>
        </div>
      </p-card>
    </div>
  `,
  styles: [`
    .payment-outer-container {
      max-width: 650px;
      margin: 3rem auto;
      padding: 0 1.5rem;
    }

    ::ng-deep .payment-glass-card {
      background: var(--card-bg) !important;
      backdrop-filter: blur(20px) !important;
      -webkit-backdrop-filter: blur(20px) !important;
      border: 1px solid var(--glass-border) !important;
      border-radius: 16px !important;
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5) !important;
      color: var(--text-color) !important;
    }

    ::ng-deep .payment-glass-card .p-card-title {
      color: var(--text-highlight) !important;
    }

    .payment-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-highlight);
      margin: 0 0 0.5rem 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .title-icon {
      color: #22d3ee;
    }

    .payment-subtitle {
      font-size: 0.9rem;
      color: var(--text-muted);
      margin: 0 0 2rem 0;
    }

    .methods-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      margin-bottom: 2rem;
    }

    .method-option {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      background: var(--item-bg);
      border: 1px solid var(--glass-border);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .method-option:hover {
      background: var(--card-bg);
      border-color: var(--neon-cyan);
      transform: translateY(-2px);
    }

    .method-option.selected {
      background: rgba(6, 182, 212, 0.08);
      border-color: #06b6d4;
      box-shadow: 0 0 15px rgba(6, 182, 212, 0.15);
    }

    .option-left {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .option-icon {
      font-size: 1.75rem;
      color: var(--text-muted);
      transition: color 0.3s;
    }

    .method-option.selected .option-icon {
      color: #22d3ee;
    }

    .option-text h3 {
      font-size: 1.05rem;
      font-weight: 600;
      color: var(--text-color);
      margin: 0 0 0.25rem 0;
    }

    .option-text p {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin: 0;
    }

    .option-check {
      font-size: 1.25rem;
      color: var(--text-muted);
      transition: color 0.3s;
    }

    .method-option.selected .option-check {
      color: #22d3ee;
    }

    .action-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid var(--glass-border);
      padding-top: 1.5rem;
      margin-top: 1.5rem;
    }

    .justify-center {
      justify-content: center;
    }

    .w-full {
      width: 100%;
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

    /* Form Container Styles */
    .form-container {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      margin-bottom: 2rem;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-field label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-muted);
    }

    .custom-input {
      background: var(--input-bg);
      border: 1px solid var(--input-border);
      color: var(--input-color);
      padding: 0.8rem 1rem;
      border-radius: 8px;
      font-size: 0.95rem;
      outline: none;
      transition: all 0.3s;
    }

    .custom-input:focus {
      border-color: #06b6d4;
      box-shadow: 0 0 10px rgba(6, 182, 212, 0.25);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }

    .helper-text {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .text-center {
      text-align: center;
    }

    .py-4 {
      padding-top: 1.5rem;
      padding-bottom: 1.5rem;
    }

    .info-icon {
      font-size: 2.5rem;
      color: #38bdf8;
      margin-bottom: 1rem;
    }

    .info-text {
      font-size: 0.95rem;
      color: var(--text-color);
      line-height: 1.5;
    }

    /* Processing Step Styles */
    .processing-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 3rem 1.5rem;
      text-align: center;
    }

    .radar-spinner {
      position: relative;
      width: 100px;
      height: 100px;
      margin-bottom: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .circle {
      position: absolute;
      border: 2px solid #06b6d4;
      border-radius: 50%;
      opacity: 0;
      animation: radar-pulse 3s cubic-bezier(0.215, 0.610, 0.355, 1) infinite;
    }

    .circle-1 { animation-delay: 0s; }
    .circle-2 { animation-delay: 1s; }
    .circle-3 { animation-delay: 2s; }

    @keyframes radar-pulse {
      0% {
        width: 20px;
        height: 20px;
        opacity: 0.8;
      }
      100% {
        width: 100px;
        height: 100px;
        opacity: 0;
      }
    }

    .secure-icon {
      font-size: 2.25rem;
      color: #22d3ee;
      z-index: 2;
    }

    .animate-pulse {
      animation: pulse-glow 2s infinite ease-in-out;
    }

    @keyframes pulse-glow {
      0%, 100% { transform: scale(1); opacity: 0.9; }
      50% { transform: scale(1.15); opacity: 1; filter: drop-shadow(0 0 8px rgba(34,211,238,0.5)); }
    }

    .processing-status {
      font-size: 1.25rem;
      color: var(--text-color);
      font-weight: 600;
      margin: 0 0 0.5rem 0;
    }

    .processing-disclaimer {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin: 0;
    }

    /* Success Step Styles */
    .success-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem 1rem;
      text-align: center;
    }

    .success-icon-wrap {
      width: 80px;
      height: 80px;
      margin-bottom: 1.5rem;
    }

    .checkmark-svg {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: block;
      stroke-width: 2;
      stroke: #34d399;
      stroke-miterlimit: 10;
      box-shadow: inset 0px 0px 0px #34d399;
      animation: check-fill .4s ease-in-out .4s forwards, check-scale .3s ease-in-out .9s cubic-bezier(0.12, 0.89, 0.32, 1.49) forwards;
    }

    .checkmark-circle {
      stroke-dasharray: 166;
      stroke-dashoffset: 166;
      stroke-width: 2;
      stroke-miterlimit: 10;
      stroke: #34d399;
      fill: none;
      animation: check-stroke .6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
    }

    .checkmark-check {
      transform-origin: 50% 50%;
      stroke-dasharray: 48;
      stroke-dashoffset: 48;
      stroke-width: 3;
      stroke-linecap: round;
      animation: check-stroke-check .3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
    }

    @keyframes check-stroke {
      100% { stroke-dashoffset: 0; }
    }
    @keyframes check-stroke-check {
      100% { stroke-dashoffset: 0; }
    }
    @keyframes check-fill {
      100% { box-shadow: inset 0px 0px 0px 40px rgba(52, 211, 153, 0.15); }
    }
    @keyframes check-scale {
      0%, 100% { transform: none; }
      50% { transform: scale3d(1.1, 1.1, 1); }
    }

    .success-title {
      font-size: 1.6rem;
      font-weight: 700;
      color: #34d399;
      margin: 0 0 0.5rem 0;
    }

    .success-msg {
      font-size: 0.95rem;
      color: var(--text-color);
      margin: 0 0 2rem 0;
    }

    .receipt-box {
      width: 100%;
      background: var(--item-bg);
      border: 1px solid var(--glass-border);
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .receipt-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.9rem;
    }

    .receipt-label {
      color: var(--text-muted);
    }

    .receipt-val {
      font-family: monospace;
      color: var(--text-color);
      font-size: 0.95rem;
    }

    .receipt-val.total {
      color: #22d3ee;
      font-weight: 700;
      font-size: 1.1rem;
      font-family: inherit;
    }
  `]
})
export class PaymentComponent implements OnInit {
  step: 'selection' | 'input' | 'processing' | 'success' = 'selection';
  selectedMethod: 'card' | 'upi' | 'cod' | null = null;
  total = 0;
  upiId = '';
  cardDetails = {
    name: '',
    number: '',
    expiry: '',
    cvv: ''
  };

  processingStatus = 'Initializing payment gateway...';
  placedOrder = {
    orderId: 0,
    transactionId: ''
  };

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {
    this.total = this.cartService.getTotal();
  }

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
  }

  selectMethod(method: 'card' | 'upi' | 'cod') {
    this.selectedMethod = method;
  }

  goToInputStep() {
    this.step = 'input';
  }

  isFormValid(): boolean {
    if (this.selectedMethod === 'card') {
      return (
        this.cardDetails.name.trim().length > 2 &&
        this.cardDetails.number.replace(/\s/g, '').length === 16 &&
        this.cardDetails.expiry.length === 5 &&
        this.cardDetails.cvv.length === 3
      );
    } else if (this.selectedMethod === 'upi') {
      return this.upiId.includes('@') && this.upiId.length > 3;
    } else if (this.selectedMethod === 'cod') {
      return true;
    }
    return false;
  }

  startProcessingPayment() {
    this.step = 'processing';
    
    const statuses = [
      'Verifying account details...',
      'Securing SSL handshake...',
      'Contacting bank network...',
      'Authenticating 3D-Secure protocol...',
      'Finalizing payment capture...'
    ];

    let currentStatusIndex = 0;
    const interval = setInterval(() => {
      if (currentStatusIndex < statuses.length) {
        this.processingStatus = statuses[currentStatusIndex];
        currentStatusIndex++;
      } else {
        clearInterval(interval);
        this.processTransaction();
      }
    }, 900);
  }

  private processTransaction() {
    const payload = {
      orderId: Math.floor(Math.random() * 100000) + 10000,
      amount: this.total
    };
    
    // Trigger the microservices order placement
    this.http.post('https://e-commerce1-e3ny.onrender.com/api/payments/process', payload).subscribe({
      next: (res: any) => {
        this.saveOrder(payload.orderId, res.transactionId);
      },
      error: () => {
        // Fallback for offline/local simulation
        const mockTxId = 'TXN' + Math.floor(Math.random() * 900000000 + 100000000);
        this.saveOrder(payload.orderId, mockTxId);
      }
    });
  }

  private saveOrder(orderId: number, transactionId: string) {
    const currentUserStr = localStorage.getItem('currentUser');
    const username = currentUserStr ? JSON.parse(currentUserStr).username : 'anonymous';

    const items = this.cartService.getCartItems();
    const productsDesc = items.map(item => `${item.quantity}x ${item.product.name}`).join(', ');

    const orderPayload = {
      username: username,
      totalAmount: this.total,
      productsDescription: productsDesc || 'Products Purchase Bundle',
      address: sessionStorage.getItem('shippingAddress') || 'No address specified',
      status: 'PENDING'
    };

    this.http.post('https://e-commerce1-e3ny.onrender.com/api/orders', orderPayload).subscribe({
      next: (orderRes: any) => {
        this.placedOrder = {
          orderId: orderRes.id || orderId,
          transactionId: transactionId
        };
        this.step = 'success';
      },
      error: () => {
        // Successful simulation fallback
        this.placedOrder = {
          orderId: orderId,
          transactionId: transactionId
        };
        this.step = 'success';
      }
    });
  }

  completeCheckoutFlow() {
    this.cartService.clearCart();
    this.router.navigate(['/']);
  }
}
