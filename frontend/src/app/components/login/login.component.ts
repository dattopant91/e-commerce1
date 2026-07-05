import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';

import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, CardModule, RouterModule],
  template: `
    <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh;">
      <p-card header="Sign In" [style]="{ width: '400px' }" styleClass="glass-card">
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div style="display: flex; flex-direction: column; gap: .5rem;">
            <label>Username</label>
            <input type="text" pInputText [(ngModel)]="username" />
          </div>
          <div style="display: flex; flex-direction: column; gap: .5rem;">
            <label>Password</label>
            <input type="password" pInputText [(ngModel)]="password" />
          </div>
          <button pButton label="Login" (click)="onLogin()" class="p-button-cyan" style="margin-top: 1rem;"></button>
          <div style="text-align: center; margin-top: .5rem;">
            <span style="font-size: 0.875rem; color: #94a3b8;">Don't have an account? <a routerLink="/signup" style="color: #06b6d4;">Signup</a></span>
          </div>
        </div>
      </p-card>
    </div>
  `
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {}

  onLogin() {
    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.cartService.initCart();
        this.router.navigate(['/']);
      },
      error: (err) => {
        const errorMsg = (err.error && err.error.message) || err.error || 'Invalid credentials';
        alert(errorMsg);
      }
    });
  }
}
