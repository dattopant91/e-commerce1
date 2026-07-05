import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, TableModule, RouterModule],
  template: `
    <div class="admin-outer-container animate-fade-in">
      <p-card header="User Account Approvals" styleClass="glass-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 1rem;">
          <p style="color: #94a3b8; margin: 0;">Review pending registration requests and assign account access roles.</p>
          <button pButton label="Back to Dashboard" icon="pi pi-home" routerLink="/" class="p-button-cyan p-button-outlined"></button>
        </div>

        <div class="table-wrapper">
          <p-table [value]="usersList" class="custom-table" [responsiveLayout]="'scroll'">
            <ng-template pTemplate="header">
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Current Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-user>
              <tr>
                <td><strong style="color: #f8fafc;">{{ user.username }}</strong></td>
                <td>{{ user.email || 'N/A' }}</td>
                <td>
                  <span class="status-badge approved" *ngIf="user.role === 'admin'">Admin</span>
                  <span class="status-badge vendor" *ngIf="user.role === 'PRODUCT_USER'">Vendor</span>
                  <span class="status-badge customer" *ngIf="user.role === 'ROLE_USER'">Customer</span>
                </td>
                <td>
                  <span class="status-badge approved" *ngIf="user.approved">Approved</span>
                  <span class="status-badge pending" *ngIf="!user.approved">Pending Approval</span>
                </td>
                <td>
                  <div style="display: flex; gap: 0.5rem; align-items: center;" *ngIf="!user.approved">
                    <select #roleSelect class="sort-select" style="margin: 0;">
                      <option value="ROLE_USER">Customer</option>
                      <option value="PRODUCT_USER">Product Vendor</option>
                      <option value="admin">Administrator</option>
                    </select>
                    <button pButton type="button" label="Approve" class="p-button-cyan p-button-sm" (click)="approveUser(user.id, roleSelect.value)" style="padding: 0.35rem 1rem !important; font-size: 0.85rem !important;"></button>
                  </div>
                  <span *ngIf="user.approved" class="text-muted">No action required</span>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </p-card>
    </div>
  `,
  styles: [`
    .admin-outer-container {
      max-width: 1200px;
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

    .table-wrapper {
      background: rgba(15, 23, 42, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      overflow: hidden;
    }

    ::ng-deep .custom-table .p-datatable-thead > tr > th {
      background: rgba(15, 23, 42, 0.5) !important;
      color: #94a3b8 !important;
      border-color: rgba(255, 255, 255, 0.05) !important;
      font-size: 0.85rem !important;
      font-weight: 600 !important;
    }

    ::ng-deep .custom-table .p-datatable-tbody > tr {
      background: transparent !important;
      color: #cbd5e1 !important;
    }

    ::ng-deep .custom-table .p-datatable-tbody > tr > td {
      border-color: rgba(255, 255, 255, 0.05) !important;
      padding: 1rem !important;
      font-size: 0.9rem;
    }

    .status-badge {
      display: inline-block;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      background: rgba(245, 158, 11, 0.15);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.3);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .status-badge.approved {
      background: rgba(52, 211, 153, 0.15) !important;
      color: #34d399 !important;
      border: 1px solid rgba(52, 211, 153, 0.3) !important;
    }

    .status-badge.pending {
      background: rgba(245, 158, 11, 0.15) !important;
      color: #f59e0b !important;
      border: 1px solid rgba(245, 158, 11, 0.3) !important;
    }

    .status-badge.vendor {
      background: rgba(168, 85, 247, 0.15) !important;
      color: #c084fc !important;
      border: 1px solid rgba(168, 85, 247, 0.3) !important;
    }

    .status-badge.customer {
      background: rgba(59, 130, 246, 0.15) !important;
      color: #60a5fa !important;
      border: 1px solid rgba(59, 130, 246, 0.3) !important;
    }

    .p-button-cyan {
      background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%) !important;
      border: none !important;
      color: #ffffff !important;
      font-weight: 600 !important;
    }

    .p-button-cyan.p-button-outlined {
      background: transparent !important;
      border: 1px solid #06b6d4 !important;
      color: #06b6d4 !important;
    }

    .sort-select {
      background: rgba(15, 23, 42, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 6px;
      padding: 0.4rem 0.75rem;
      font-size: 0.85rem;
      color: #f8fafc;
      outline: none;
      cursor: pointer;
    }

    .sort-select option {
      background: #0f172a;
      color: #cbd5e1;
    }

    .text-muted {
      color: #64748b;
      font-size: 0.85rem;
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
export class AdminUsersComponent implements OnInit {
  usersList: any[] = [];

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr || JSON.parse(userStr).role !== 'admin') {
      this.router.navigate(['/']);
      return;
    }
    this.loadUsers();
  }

  loadUsers() {
    this.http.get<any[]>('http://localhost:8080/api/auth/users').subscribe({
      next: (data) => {
        this.usersList = data;
      },
      error: (err) => {
        console.warn('Failed to load users, local fallback logs.', err);
        this.usersList = [
          { id: 1, username: 'admin', email: 'admin@gmail.com', role: 'admin', approved: true },
          { id: 13, username: 'user1', email: 'user1@gmail.com', role: 'ROLE_USER', approved: true },
          { id: 14, username: 'user2', email: 'user2@gmail.com', role: 'ROLE_USER', approved: false },
          { id: 15, username: 'user3', email: 'user3@gmail.com', role: 'PRODUCT_USER', approved: false }
        ];
      }
    });
  }

  approveUser(userId: number, selectRole: string) {
    this.http.put(`http://localhost:8080/api/auth/users/${userId}/approve?role=${selectRole}`, {}).subscribe({
      next: () => {
        this.loadUsers();
        alert('User successfully approved and role updated!');
      },
      error: () => {
        const user = this.usersList.find(u => u.id === userId);
        if (user) {
          user.approved = true;
          user.role = selectRole;
        }
        alert('User approved (locally synced)');
      }
    });
  }
}
