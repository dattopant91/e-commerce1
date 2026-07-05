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
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, TableModule, RouterModule],
  template: `
    <div class="admin-outer-container animate-fade-in">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 1rem;">
        <div>
          <h1 style="margin: 0; color: #f8fafc; font-size: 1.8rem; font-weight: 800;">Order Reviews Dashboard</h1>
          <p style="color: #94a3b8; margin: 0.25rem 0 0 0;">Review, Approve, or Reject user orders placed across the system.</p>
        </div>
        <button pButton label="Back to Dashboard" icon="pi pi-home" routerLink="/" class="p-button-cyan p-button-outlined"></button>
      </div>

      <div class="orders-split-layout">
        <!-- LEFT PANEL: ORDERS LIST -->
        <div class="left-panel">
          <p-card styleClass="glass-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
              <h3 style="margin: 0; color: #f8fafc; font-size: 1.1rem; font-weight: 700;">Purchase History Log</h3>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <input type="checkbox" id="pendingFilter" [(ngModel)]="showOnlyPending" style="cursor: pointer; transform: scale(1.1);" />
                <label for="pendingFilter" style="color: #f8fafc; font-size: 0.85rem; cursor: pointer; user-select: none; font-weight: 600;">Pending Only</label>
              </div>
            </div>

            <div class="table-wrapper">
              <p-table [value]="showOnlyPending ? getPendingOrders() : allOrders" class="custom-table" [responsiveLayout]="'scroll'">
                <ng-template pTemplate="header">
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-order>
                  <tr (click)="selectOrder(order)" [class.selected-row]="selectedOrder && selectedOrder.id === order.id" class="clickable-row">
                    <td class="order-id">#{{ order.id }}</td>
                    <td>{{ order.username }}</td>
                    <td class="price">{{ order.totalAmount | currency }}</td>
                    <td>
                      <span class="status-badge" [class.approved]="order.status === 'APPROVED' || order.status === 'PAID'" [class.pending]="order.status === 'PENDING'" [class.rejected]="order.status === 'REJECTED'">
                        {{ order.status }}
                      </span>
                    </td>
                  </tr>
                </ng-template>
              </p-table>
            </div>
          </p-card>
        </div>

        <!-- RIGHT PANEL: DETAILS PANEL -->
        <div class="right-panel">
          <!-- Selection Placeholder -->
          <div *ngIf="!selectedOrder" class="placeholder-box glass-card-no-padding">
            <i class="pi pi-shopping-bag placeholder-icon"></i>
            <h3>Select an Order</h3>
            <p>Choose an order row from the left panel to review items and handle approvals.</p>
          </div>

          <!-- Order Details Card -->
          <p-card *ngIf="selectedOrder" styleClass="glass-card details-card animate-slide-in">
            <div class="details-header">
              <h2>Order #{{ selectedOrder.id }}</h2>
              <span class="status-badge" [class.approved]="selectedOrder.status === 'APPROVED' || selectedOrder.status === 'PAID'" [class.pending]="selectedOrder.status === 'PENDING'" [class.rejected]="selectedOrder.status === 'REJECTED'">
                {{ selectedOrder.status }}
              </span>
            </div>

            <div class="details-info-grid">
              <div class="info-row">
                <span class="info-label"><i class="pi pi-user"></i> Customer Name</span>
                <span class="info-val">{{ selectedOrder.username }}</span>
              </div>
              <div class="info-row">
                <span class="info-label"><i class="pi pi-calendar"></i> Purchase Date</span>
                <span class="info-val">{{ selectedOrder.orderDate | date:'medium' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label"><i class="pi pi-wallet"></i> Total Amount</span>
                <span class="info-val text-cyan font-bold" style="font-size: 1.15rem;">{{ selectedOrder.totalAmount | currency }}</span>
              </div>
              <div class="info-row" style="flex-direction: column; align-items: flex-start; gap: 0.25rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.75rem;">
                <span class="info-label"><i class="pi pi-map-marker"></i> Shipping Address</span>
                <span class="info-val" style="color: #cbd5e1; font-weight: normal; font-size: 0.85rem; line-height: 1.4; margin-top: 0.25rem; text-align: left;">{{ selectedOrder.address || 'No address specified' }}</span>
              </div>
            </div>

            <div class="products-list-section">
              <h4>Items Ordered</h4>
              <div class="products-box">
                <p>{{ selectedOrder.productsDescription || 'E-Commerce products bundle' }}</p>
              </div>
            </div>

            <!-- Action buttons -->
            <div class="details-actions" *ngIf="selectedOrder.status === 'PENDING'">
              <button pButton label="Approve & Place Order" icon="pi pi-check" class="p-button-success w-full" (click)="approveOrder(selectedOrder.id)"></button>
              <button pButton label="Reject Order" icon="pi pi-times" class="p-button-danger p-button-outlined w-full" (click)="rejectOrder(selectedOrder.id)"></button>
            </div>
            
            <div class="details-footer" *ngIf="selectedOrder.status !== 'PENDING'">
              <i class="pi pi-info-circle"></i> This purchase has been fully processed and closed.
            </div>
          </p-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-outer-container {
      max-width: 1300px;
      margin: 3rem auto;
      padding: 0 1.5rem;
    }

    .orders-split-layout {
      display: grid;
      grid-template-columns: 1.3fr 1fr;
      gap: 2rem;
      align-items: start;
    }

    @media (max-width: 992px) {
      .orders-split-layout {
        grid-template-columns: 1fr;
      }
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

    .clickable-row {
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .clickable-row:hover {
      background: rgba(255, 255, 255, 0.02) !important;
    }

    .selected-row {
      background: rgba(6, 182, 212, 0.08) !important;
      border-left: 3px solid #06b6d4 !important;
    }

    .order-id {
      font-family: monospace;
      color: #22d3ee;
      font-weight: 600;
    }

    .price {
      font-weight: 600;
      color: #cbd5e1;
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

    .status-badge.rejected {
      background: rgba(239, 68, 68, 0.15) !important;
      color: #f87171 !important;
      border: 1px solid rgba(239, 68, 68, 0.3) !important;
    }

    /* Details Panel Styles */
    .placeholder-box {
      border: 1px dashed rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 4rem 2rem;
      text-align: center;
      background: rgba(30, 41, 59, 0.2);
    }

    .placeholder-icon {
      font-size: 3rem;
      color: #475569;
      margin-bottom: 1rem;
    }

    .placeholder-box h3 {
      color: #f8fafc;
      margin: 0 0 0.5rem 0;
    }

    .placeholder-box p {
      color: #64748b;
      margin: 0;
      font-size: 0.9rem;
    }

    .details-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 1rem;
      margin-bottom: 1.5rem;
    }

    .details-header h2 {
      margin: 0;
      color: #f8fafc;
      font-size: 1.35rem;
      font-weight: 800;
    }

    .details-info-grid {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
    }

    .info-label {
      color: #64748b;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .info-val {
      color: #f8fafc;
      font-weight: 600;
    }

    .text-cyan {
      color: #22d3ee !important;
    }

    .font-bold {
      font-weight: 700;
    }

    .products-list-section h4 {
      color: #94a3b8;
      font-size: 0.85rem;
      text-transform: uppercase;
      margin: 0 0 0.75rem 0;
      letter-spacing: 0.05em;
      font-weight: 700;
    }

    .products-box {
      background: rgba(15, 23, 42, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 1rem;
      color: #cbd5e1;
      max-height: 180px;
      overflow-y: auto;
      font-size: 0.95rem;
      line-height: 1.6;
      margin-bottom: 2rem;
    }

    .details-actions {
      display: flex;
      gap: 1rem;
    }

    .details-footer {
      text-align: center;
      color: #64748b;
      font-size: 0.9rem;
      border-top: 1px solid rgba(255,255,255,0.05);
      padding-top: 1rem;
    }

    .w-full {
      width: 100%;
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

    .p-button-success {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
      border: none !important;
      color: #ffffff !important;
      font-weight: 700 !important;
      padding: 0.75rem !important;
    }

    .p-button-danger.p-button-outlined {
      background: transparent !important;
      border: 1px solid #ef4444 !important;
      color: #ef4444 !important;
      font-weight: 700 !important;
      padding: 0.75rem !important;
    }

    .animate-fade-in {
      animation: fadeIn 0.4s ease-out forwards;
    }

    .animate-slide-in {
      animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateX(15px); }
      to { opacity: 1; transform: translateX(0); }
    }
  `]
})
export class AdminOrdersComponent implements OnInit {
  allOrders: any[] = [];
  selectedOrder: any = null;
  showOnlyPending = true;

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
    this.loadAllOrders();
  }

  loadAllOrders() {
    this.http.get<any[]>('https://e-commerce1-e3ny.onrender.com/api/orders').subscribe({
      next: (data) => {
        this.allOrders = data.sort((a, b) => b.id - a.id);
        // Reselect order to sync changes if open
        if (this.selectedOrder) {
          const fresh = this.allOrders.find(o => o.id === this.selectedOrder.id);
          if (fresh) {
            this.selectedOrder = fresh;
          }
        }
      },
      error: (err) => {
        console.warn('Failed to load orders, using offline fallback.', err);
        this.allOrders = [
          { id: 101, username: 'user1', totalAmount: 49.99, productsDescription: '1x Mechanical Keyboard', status: 'PENDING', orderDate: new Date() },
          { id: 102, username: 'user2', totalAmount: 199.99, productsDescription: '1x Studio Headset', status: 'APPROVED', orderDate: new Date() }
        ];
      }
    });
  }

  getPendingOrders(): any[] {
    return this.allOrders.filter(o => o.status === 'PENDING');
  }

  selectOrder(order: any) {
    this.selectedOrder = order;
  }

  approveOrder(orderId: number) {
    this.http.put(`https://e-commerce1-e3ny.onrender.com/api/orders/${orderId}/status?status=APPROVED`, {}).subscribe({
      next: () => {
        this.loadAllOrders();
        alert('Order #' + orderId + ' successfully approved! Customer delivery has been processed.');
      },
      error: () => {
        // Local state sync mode fallback
        const order = this.allOrders.find(o => o.id === orderId);
        if (order) {
          order.status = 'APPROVED';
        }
        if (this.selectedOrder && this.selectedOrder.id === orderId) {
          this.selectedOrder.status = 'APPROVED';
        }
        alert('Order approved (local preview mode)');
      }
    });
  }

  rejectOrder(orderId: number) {
    this.http.put(`https://e-commerce1-e3ny.onrender.com/api/orders/${orderId}/status?status=REJECTED`, {}).subscribe({
      next: () => {
        this.loadAllOrders();
        alert('Order #' + orderId + ' has been rejected.');
      },
      error: () => {
        // Local state sync mode fallback
        const order = this.allOrders.find(o => o.id === orderId);
        if (order) {
          order.status = 'REJECTED';
        }
        if (this.selectedOrder && this.selectedOrder.id === orderId) {
          this.selectedOrder.status = 'REJECTED';
        }
        alert('Order rejected (local preview mode)');
      }
    });
  }
}
