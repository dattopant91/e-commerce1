import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TableModule, RouterModule],
  template: `
    <div class="profile-outer-container animate-fade-in">
      <div class="profile-grid">
        <!-- USER DETAILS CARD -->
        <p-card styleClass="profile-glass-card">
          <div class="user-card-header">
            <div class="profile-avatar">
              <span>{{ username.charAt(0).toUpperCase() }}</span>
            </div>
            <h2>{{ username }}</h2>
            <span class="profile-role-tag">{{ isAdmin ? 'Administrator' : 'Customer Account' }}</span>
          </div>
          
          <div class="user-details-list">
            <div class="detail-row">
              <span class="detail-label"><i class="pi pi-envelope"></i> Email</span>
              <span class="detail-val">{{ email }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label"><i class="pi pi-shield"></i> Security Status</span>
              <span class="detail-val text-success">Verified Session</span>
            </div>
            <div class="detail-row" *ngIf="isAdmin">
              <span class="detail-label"><i class="pi pi-sliders-h"></i> Permissions</span>
              <span class="detail-val">Full Read/Write</span>
            </div>
          </div>

          <div class="profile-actions-footer">
            <button pButton label="Back to Shop" icon="pi pi-home" routerLink="/" class="p-button-cyan w-full"></button>
          </div>
        </p-card>

        <!-- ORDER HISTORY CARD -->
        <p-card header="Order History" styleClass="orders-glass-card" *ngIf="!isAdmin">
          <p class="orders-subtitle">Manage and track your past transactions and purchases</p>
          
          <!-- Empty State -->
          <div *ngIf="orders.length === 0" class="empty-orders">
            <i class="pi pi-shopping-bag empty-orders-icon"></i>
            <p>You haven't placed any orders yet.</p>
            <button pButton label="Start Shopping" routerLink="/" class="p-button-cyan p-button-outlined p-button-sm"></button>
          </div>

          <!-- Orders Table -->
          <div *ngIf="orders.length > 0" class="orders-table-wrapper">
            <p-table [value]="orders" class="custom-orders-table" [responsiveLayout]="'scroll'">
              <ng-template pTemplate="header">
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Products Purchased</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-order>
                <tr>
                  <td class="order-id">#{{ order.id }}</td>
                  <td>{{ order.orderDate | date:'medium' }}</td>
                  <td style="color: #cbd5e1; max-width: 300px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;" [title]="order.productsDescription || 'E-Commerce products bundle'">
                    {{ order.productsDescription || 'E-Commerce products bundle' }}
                  </td>
                  <td class="order-amount">{{ order.totalAmount | currency }}</td>
                  <td>
                    <span class="status-badge" 
                          [class.approved]="order.status === 'APPROVED' || order.status === 'PAID'" 
                          [class.shipped]="order.status === 'SHIPPED'"
                          [class.delivered]="order.status === 'DELIVERED'"
                          [class.pending]="order.status === 'PENDING'" 
                          [class.rejected]="order.status === 'REJECTED'">
                      {{ order.status }}
                    </span>
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </div>
        </p-card>

        <!-- ADMIN INFO CARD -->
        <p-card header="Administrative Statistics" styleClass="orders-glass-card" *ngIf="isAdmin">
          <p class="orders-subtitle">System settings overview and global metrics access controls.</p>
          <div class="admin-stats-box">
            <div class="admin-stat-item">
              <i class="pi pi-users stat-icon"></i>
              <div>
                <h3>System Users</h3>
                <p>12 Active Registered Accounts</p>
              </div>
            </div>
            <div class="admin-stat-item">
              <i class="pi pi-server stat-icon"></i>
              <div>
                <h3>Microservices</h3>
                <p>7 Services Registered on Eureka</p>
              </div>
            </div>
            <div class="admin-stat-item">
              <i class="pi pi-database stat-icon"></i>
              <div>
                <h3>Database Pool</h3>
                <p>Active MySQL Schema Pool Connections</p>
              </div>
            </div>
          </div>
        </p-card>
      </div>
    </div>
  `,
  styles: [`
    .profile-outer-container {
      max-width: 1100px;
      margin: 3rem auto;
      padding: 0 1.5rem;
    }

    .profile-grid {
      display: grid;
      grid-template-columns: 1fr 1.6fr;
      gap: 2rem;
    }

    @media (max-width: 768px) {
      .profile-grid {
        grid-template-columns: 1fr;
      }
    }

    ::ng-deep .profile-glass-card, ::ng-deep .orders-glass-card {
      background: var(--card-bg) !important;
      backdrop-filter: blur(20px) !important;
      -webkit-backdrop-filter: blur(20px) !important;
      border: 1px solid var(--glass-border) !important;
      border-radius: 16px !important;
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5) !important;
      color: var(--text-color) !important;
    }

    ::ng-deep .profile-glass-card .p-card-title, ::ng-deep .orders-glass-card .p-card-title {
      color: var(--text-highlight) !important;
    }

    .user-card-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--glass-border);
      margin-bottom: 1.5rem;
    }

    .profile-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #06b6d4, #818cf8);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      color: #ffffff;
      font-size: 2.25rem;
      box-shadow: 0 10px 20px rgba(6, 182, 212, 0.25);
      margin-bottom: 1rem;
    }

    .user-card-header h2 {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-highlight);
      margin: 0 0 0.35rem 0;
    }

    .profile-role-tag {
      background: rgba(34, 211, 238, 0.12);
      border: 1px solid rgba(34, 211, 238, 0.3);
      color: #22d3ee;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.2rem 0.65rem;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .user-details-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.9rem;
    }

    .detail-label {
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .detail-val {
      color: var(--text-color);
      font-weight: 500;
    }

    .text-success {
      color: #34d399 !important;
    }

    .profile-actions-footer {
      margin-top: 1rem;
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

    /* Orders History Styles */
    .orders-subtitle {
      font-size: 0.9rem;
      color: var(--text-muted);
      margin: 0 0 1.5rem 0;
    }

    .empty-orders {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 3rem 1.5rem;
      gap: 1rem;
    }

    .empty-orders-icon {
      font-size: 3rem;
      color: var(--text-muted);
    }

    .empty-orders p {
      color: var(--text-muted);
      font-size: 0.95rem;
      margin: 0;
    }

    .orders-table-wrapper {
      background: var(--panel-bg);
      border: 1px solid var(--glass-border);
      border-radius: 12px;
      overflow: hidden;
    }

    /* Order History Table */
    ::ng-deep .custom-orders-table .p-datatable-thead > tr > th {
      background: var(--panel-bg) !important;
      color: var(--text-muted) !important;
      border-color: var(--glass-border) !important;
      font-size: 0.85rem !important;
      font-weight: 600 !important;
    }

    ::ng-deep .custom-orders-table .p-datatable-tbody > tr {
      background: transparent !important;
      color: var(--text-color) !important;
    }

    ::ng-deep .custom-orders-table .p-datatable-tbody > tr > td {
      border-color: var(--glass-border) !important;
      padding: 1rem !important;
      font-size: 0.9rem;
      color: var(--text-color) !important;
    }

    .order-id {
      font-family: monospace;
      color: #22d3ee;
      font-weight: 600;
    }

    .order-amount {
      font-weight: 600;
      color: #f8fafc;
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

    .status-badge.shipped {
      background: rgba(34, 211, 238, 0.15) !important;
      color: #22d3ee !important;
      border: 1px solid rgba(34, 211, 238, 0.3) !important;
    }

    .status-badge.delivered {
      background: rgba(16, 185, 129, 0.15) !important;
      color: #10b981 !important;
      border: 1px solid rgba(16, 185, 129, 0.3) !important;
    }

    .status-badge.pending {
      background: rgba(245, 158, 11, 0.15) !important;
      color: #f59e0b !important;
      border: 1px solid rgba(245, 158, 11, 0.3) !important;
    }

    .status-badge.rejected {
      background: rgba(239, 68, 68, 0.15) !important;
      color: #f87171 !important;
      border: 1px solid rgba(239, 68, 68, 0.3) !important;
    }

    /* Admin statistics styles */
    .admin-stats-box {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .admin-stat-item {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.25rem;
      background: var(--item-bg);
      border: 1px solid var(--glass-border);
      border-radius: 12px;
    }

    .stat-icon {
      font-size: 1.75rem;
      color: #22d3ee;
      background: rgba(34, 211, 238, 0.1);
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }

    .admin-stat-item h3 {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text-color);
      margin: 0 0 0.15rem 0;
    }

    .admin-stat-item p {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin: 0;
    }

    /* Animation */
    .animate-fade-in {
      animation: fadeIn 0.4s ease-out forwards;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ProfileComponent implements OnInit {
  username = '';
  email = '';
  isAdmin = false;
  orders: any[] = [];

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      this.router.navigate(['/login']);
      return;
    }

    const user = JSON.parse(userStr);
    this.username = user.username;
    this.email = user.email || `${user.username}@ecommerce.com`;
    this.isAdmin = user.role === 'admin';

    if (!this.isAdmin) {
      this.loadOrders();
    }
  }

  loadOrders() {
    this.http.get<any[]>(`https://e-commerce1-e3ny.onrender.com/api/orders?username=${this.username}`).subscribe({
      next: (data) => {
        // Sort orders so latest is first
        this.orders = data.sort((a, b) => b.id - a.id);
      },
      error: () => {
        console.warn('Failed to load orders, fallback simulation details.');
      }
    });
  }
}
