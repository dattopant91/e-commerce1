import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, RouterModule, FormsModule],
  template: `
    <div style="max-width: 600px; margin: 4rem auto; padding: 0 1.5rem;">
      <p-card header="Delivery & Checkout" styleClass="glass-card">
        <p style="color: #94a3b8;">Review your shipping address and billing details below before proceeding to payment.</p>
        
        <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 1.5rem; margin-top: 1.5rem;">
          <h4 style="margin: 0 0 0.75rem 0; color: #f8fafc; font-size: 1rem; font-weight: 600;">Shipping Address</h4>
          <textarea 
            [(ngModel)]="address" 
            rows="3" 
            style="width: 100%; background: rgba(15, 23, 42, 0.45); border: 1px solid rgba(255, 255, 255, 0.1); color: #f8fafc; border-radius: 8px; padding: 0.8rem; font-family: inherit; font-size: 0.95rem; resize: none; outline: none; transition: border-color 0.3s;" 
            placeholder="Type your complete delivery address here..."
            onfocus="this.style.borderColor='#06b6d4'"
            onblur="this.style.borderColor='rgba(255,255,255,0.1)'"
          ></textarea>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 1.5rem;">
          <button pButton label="Back" routerLink="/cart" class="p-button-text p-button-secondary"></button>
          <button pButton label="Proceed to Payment" (click)="proceedToPayment()" [disabled]="!address.trim()" class="p-button-cyan"></button>
        </div>
      </p-card>
    </div>
  `,
  styles: [`
    ::ng-deep .glass-card {
      background: rgba(30, 41, 59, 0.45) !important;
      backdrop-filter: blur(20px) !important;
      -webkit-backdrop-filter: blur(20px) !important;
      border: 1px solid rgba(255, 255, 255, 0.08) !important;
      border-radius: 16px !important;
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5) !important;
    }
    .p-button-cyan {
      background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%) !important;
      border: none !important;
      color: #ffffff !important;
      font-weight: 600 !important;
      padding: 0.65rem 1.5rem !important;
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
  `]
})
export class CheckoutComponent implements OnInit {
  address: string = '123 Tech Lane, Silicon Valley, CA';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    const saved = sessionStorage.getItem('shippingAddress');
    if (saved) {
      this.address = saved;
    }
  }

  proceedToPayment() {
    sessionStorage.setItem('shippingAddress', this.address);
    this.router.navigate(['/payment']);
  }
}
