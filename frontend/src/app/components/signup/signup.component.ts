import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, CardModule, RouterModule],
  template: `
    <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh;">
      <p-card header="Create Account" [style]="{ width: '400px' }" styleClass="glass-card">
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div style="display: flex; flex-direction: column; gap: .5rem;">
            <label>Username</label>
            <input type="text" pInputText [(ngModel)]="username" />
          </div>
          <div style="display: flex; flex-direction: column; gap: .5rem;">
            <label>Email</label>
            <input type="email" pInputText [(ngModel)]="email" />
          </div>
          <div style="display: flex; flex-direction: column; gap: .5rem;">
            <label>Password</label>
            <input type="password" pInputText [(ngModel)]="password" />
          </div>
          <button pButton label="Sign Up" (click)="onSignup()" class="p-button-cyan" style="margin-top: 1rem;"></button>
          <div style="text-align: center; margin-top: .5rem;">
            <span style="font-size: 0.875rem; color: #94a3b8;">Already have an account? <a routerLink="/login" style="color: #06b6d4;">Login</a></span>
          </div>
        </div>
      </p-card>
    </div>
  `
})
export class SignupComponent {
  username = '';
  email = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSignup() {
    const signupData = { username: this.username, email: this.email, password: this.password };
    this.authService.register(signupData).subscribe({
      next: () => {
        alert('Registration successful! Please login.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        const errorMsg = (err.error && err.error.message) || err.error || 'Registration failed';
        alert(errorMsg);
      }
    });
  }
}
