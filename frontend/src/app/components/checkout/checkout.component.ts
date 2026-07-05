import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, RouterModule],
  template: `
    <div style="max-width: 600px; margin: 2rem auto; padding: 0 1rem;">
      <p-card header="Checkout" styleClass="glass-card">
        <p>Review your shipping address and billing details below.</p>
        <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1rem; margin-top: 1rem;">
          <h4>Shipping Address</h4>
          <p style="color: #94a3b8;">123 Tech Lane, Silicon Valley, CA</p>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem;">
          <button pButton label="Back" routerLink="/cart" class="p-button-text p-button-secondary"></button>
          <button pButton label="Proceed to Payment" routerLink="/payment" class="p-button-cyan"></button>
        </div>
      </p-card>
    </div>
  `
})
export class CheckoutComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
  }
}
