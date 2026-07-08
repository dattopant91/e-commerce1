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
    <!-- MAIN DISPLAY CONTENT -->
    <div class="profile-outer-container animate-fade-in">
      <div class="profile-grid">
        
        <!-- USER PROFILE CARD -->
        <p-card header="Profile Overview" styleClass="profile-glass-card">
          <div class="user-card-header">
            <div class="profile-avatar">
              <span>{{ username.charAt(0).toUpperCase() }}</span>
            </div>
            <h2>{{ username }}</h2>
            <span class="profile-role-tag">{{ isAdmin ? 'Admin' : 'Customer' }}</span>
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
          </div>

          <div class="profile-actions-footer">
            <button pButton label="Back to Shop" icon="pi pi-home" routerLink="/" class="p-button-cyan w-full"></button>
          </div>
        </p-card>

        <!-- ORDER HISTORY CARD (CUSTOMERS ONLY) -->
        <p-card header="Order History" styleClass="orders-glass-card" *ngIf="!isAdmin">
          <p class="orders-subtitle">Manage and track your past transactions and purchases</p>
          
          <!-- Empty State -->
          <div *ngIf="orders.length === 0" class="empty-orders">
            <i class="pi pi-shopping-bag empty-orders-icon"></i>
            <p>You haven't placed any orders yet.</p>
            <button pButton label="Start Shopping" routerLink="/" class="p-button-cyan p-button-outlined p-button-sm"></button>
          </div>

          <!-- Orders Table Layout (Desktop View) -->
          <div *ngIf="orders.length > 0" class="orders-table-wrapper hide-on-mobile">
            <p-table [value]="orders" class="custom-orders-table" [responsiveLayout]="'scroll'">
              <ng-template pTemplate="header">
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Products Purchased</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th style="width: 80px; text-align: center;">Invoice</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-order>
                <tr>
                  <td class="order-id">#{{ order.id }}</td>
                  <td>{{ order.orderDate | date:'medium' }}</td>
                  <td style="color: #cbd5e1; max-width: 250px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;" [title]="order.productsDescription || 'E-Commerce products bundle'">
                    {{ order.productsDescription || 'E-Commerce products bundle' }}
                  </td>
                  <td class="order-amount">{{ order.totalAmount | currency:'INR':'symbol':'1.2-2' }}</td>
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
                  <td style="text-align: center;">
                    <button pButton icon="pi pi-print" class="p-button-cyan p-button-text p-button-rounded print-btn" (click)="printInvoice(order)" title="Print Invoice" style="padding: 0.25rem !important; height: 32px; width: 32px;"></button>
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </div>

          <!-- Mobile Cards Layout (Mobile View) -->
          <div *ngIf="orders.length > 0" class="mobile-orders-list show-on-mobile">
            <div class="mobile-order-card" *ngFor="let order of orders">
              <div class="mobile-order-header">
                <span class="order-id">#{{ order.id }}</span>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <button pButton icon="pi pi-print" class="p-button-cyan p-button-text p-button-rounded" (click)="printInvoice(order)" title="Print Receipt" style="padding: 0.15rem !important; height: 28px; width: 28px; font-size: 0.9rem;"></button>
                  <span class="status-badge" 
                        [class.approved]="order.status === 'APPROVED' || order.status === 'PAID'" 
                        [class.shipped]="order.status === 'SHIPPED'"
                        [class.delivered]="order.status === 'DELIVERED'"
                        [class.pending]="order.status === 'PENDING'" 
                        [class.rejected]="order.status === 'REJECTED'">
                    {{ order.status }}
                  </span>
                </div>
              </div>
              <div class="mobile-order-body">
                <div class="mobile-order-row">
                  <span class="label">Date:</span>
                  <span class="val">{{ order.orderDate | date:'mediumDate' }}</span>
                </div>
                <div class="mobile-order-products">
                  {{ order.productsDescription || 'Products bundle details' }}
                </div>
                <div class="mobile-order-row total-row">
                  <span class="label">Total Amount:</span>
                  <span class="val price">{{ order.totalAmount | currency:'INR':'symbol':'1.2-2' }}</span>
                </div>
              </div>
            </div>
          </div>
        </p-card>

        <!-- ADMIN INFO CARD (ADMINS ONLY) -->
        <p-card header="Administrative Statistics" styleClass="orders-glass-card" *ngIf="isAdmin">
          <p class="orders-subtitle">System settings overview and global metrics access controls.</p>
          <div class="admin-stats-box">
            <div class="admin-stat-item">
              <i class="pi pi-users stat-icon"></i>
              <div>
                <h3>User Approvals Panel</h3>
                <p>Register and promote user profiles directly from the console.</p>
              </div>
            </div>
            <div class="admin-stat-item">
              <i class="pi pi-shopping-bag stat-icon"></i>
              <div>
                <h3>Order Shipment Reviews</h3>
                <p>Review customer checkouts, confirm transactions, and dispatch orders.</p>
              </div>
            </div>
          </div>
        </p-card>

      </div>
    </div>

    <!-- HIDDEN PRINT INVOICE SHEET (ONLY VISIBLE DURING window.print()) -->
    <div class="print-invoice-sheet" *ngIf="selectedOrderForPrint">
      <div class="invoice-header">
        <h1>SANDY CART</h1>
        <p>Premium Curated E-Commerce Marketplace</p>
      </div>
      <hr/>
      <div class="invoice-details">
        <p><strong>Order Reference ID:</strong> #{{ selectedOrderForPrint.id }}</p>
        <p><strong>Order Placement Date:</strong> {{ selectedOrderForPrint.orderDate | date:'medium' }}</p>
        <p><strong>Customer Name:</strong> {{ username }}</p>
        <p><strong>Customer Registered Email:</strong> {{ email }}</p>
        <p><strong>Order Tracking Status:</strong> {{ selectedOrderForPrint.status }}</p>
      </div>
      <hr/>
      <div class="invoice-products">
        <h3>Purchased Items Details</h3>
        <p style="white-space: pre-line; line-height: 1.6; font-size: 0.95rem; background: #f8fafc; padding: 1rem; border: 1px solid #e2e8f0; border-radius: 6px;">
          {{ selectedOrderForPrint.productsDescription || 'E-Commerce products bundle' }}
        </p>
      </div>
      <hr/>
      <div class="invoice-total">
        <h2>Total Amount Paid: {{ selectedOrderForPrint.totalAmount | currency:'INR':'symbol':'1.2-2' }}</h2>
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

    /* Desktop vs Mobile selectors */
    .hide-on-mobile {
      display: block;
    }

    .show-on-mobile {
      display: none;
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
      color: var(--text-color);
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

    /* Print Button Style */
    ::ng-deep .print-btn {
      color: #22d3ee !important;
      transition: all 0.2s;
    }
    ::ng-deep .print-btn:hover {
      background: rgba(34, 211, 238, 0.1) !important;
      transform: scale(1.1);
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

    /* Mobile media queries for orders */
    @media (max-width: 768px) {
      .hide-on-mobile {
        display: none !important;
      }

      .show-on-mobile {
        display: flex !important;
        flex-direction: column;
        gap: 1rem;
      }

      .mobile-order-card {
        background: var(--panel-bg);
        border: 1px solid var(--glass-border);
        border-radius: 12px;
        padding: 1.25rem;
      }

      .mobile-order-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--glass-border);
        padding-bottom: 0.75rem;
        margin-bottom: 0.75rem;
      }

      .mobile-order-body {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .mobile-order-row {
        display: flex;
        justify-content: space-between;
        font-size: 0.85rem;
      }

      .mobile-order-row .label {
        color: var(--text-muted);
      }

      .mobile-order-row .val {
        color: var(--text-color);
        font-weight: 600;
      }

      .mobile-order-products {
        font-size: 0.85rem;
        color: var(--text-muted);
        background: rgba(0, 0, 0, 0.15);
        padding: 0.65rem 0.85rem;
        border-radius: 8px;
        white-space: pre-line;
        line-height: 1.5;
      }

      .mobile-order-row.total-row {
        border-top: 1px dashed var(--glass-border);
        padding-top: 0.75rem;
        margin-top: 0.25rem;
      }

      .mobile-order-row.total-row .val.price {
        color: #22d3ee;
        font-weight: 800;
        font-size: 1.1rem;
      }
    }

    /* Print styles */
    .print-invoice-sheet {
      display: none;
    }

    @media print {
      .profile-outer-container, 
      .dashboard-header, 
      .theme-toggle-btn, 
      button, 
      a {
        display: none !important;
      }
      
      .print-invoice-sheet {
        display: block !important;
        background: #ffffff !important;
        color: #000000 !important;
        padding: 2.5rem !important;
        font-family: sans-serif;
      }
      
      .invoice-header {
        text-align: center;
        margin-bottom: 1.5rem;
      }
      
      .invoice-header h1 {
        margin: 0;
        font-size: 2rem;
        font-weight: 800;
        letter-spacing: 0.05em;
      }
      
      .invoice-header p {
        margin: 0.25rem 0 0 0;
        color: #555555;
        font-size: 0.9rem;
      }
      
      .invoice-details p {
        margin: 0.5rem 0;
        font-size: 0.95rem;
      }
      
      .invoice-products h3 {
        margin: 0 0 0.5rem 0;
        font-size: 1.15rem;
      }
      
      .invoice-total {
        text-align: right;
        margin-top: 2.5rem;
      }
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
  selectedOrderForPrint: any = null;

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

  printInvoice(order: any) {
    this.selectedOrderForPrint = order;
    setTimeout(() => {
      window.print();
    }, 150);
  }
}
