import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/product.model';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    RouterModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = ['All', 'Electronics', 'Apparel', 'Accessories'];
  selectedCategory: string = 'All';
  searchQuery: string = '';
  displayLimit: number = 12;
  hasMoreProducts: boolean = false;
  sortOption: string = 'default';
  
  displayDialog: boolean = false;
  isEditMode: boolean = false;
  editingProductId: number | undefined = undefined;
  
  displayDetailsDialog: boolean = false;
  selectedDetailProduct: Product | null = null;
  
  newProduct: Product = {
    name: '',
    description: '',
    price: 0,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
    stock: 10,
    status: 'PENDING'
  };

  totalSales = 45290.89;
  ordersCount = 1240;
  totalProducts = 0;
  cartCount = 0;
  
  username: string | null = null;
  isAdmin: boolean = false;
  isProductUser: boolean = false;
  
  // User Management Approval List (Admin Only)
  usersList: any[] = [];
  displayUserManagement = false;

  // Order Management List (Admin Only)
  allOrders: any[] = [];
  displayOrderManagement = false;
  displayOrderDetailsDialog = false;
  selectedOrderForApproval: any = null;
  showOnlyPendingOrders: boolean = true;

  // Add to Cart Animation state
  cartAnimating = false;
  animatedProductId: number | null = null;
  isLightTheme = false;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    public authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLightTheme = localStorage.getItem('theme') === 'light';
    this.cartService.cart$.subscribe(items => {
      this.cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
    });

    this.authService.currentUser$.subscribe(user => {
      this.username = user ? user.username : null;
      this.isAdmin = user && user.role === 'admin';
      this.isProductUser = user && (user.role === 'admin' || user.role === 'PRODUCT_USER');
      this.loadProducts();
      if (this.isAdmin) {
        this.loadUsers();
        this.loadAllOrders();
      }
    });
  }

  toggleTheme(): void {
    this.isLightTheme = !this.isLightTheme;
    const body = document.body;
    if (this.isLightTheme) {
      body.classList.add('light-theme');
      localStorage.setItem('theme', 'light');
    } else {
      body.classList.remove('light-theme');
      localStorage.setItem('theme', 'dark');
    }
  }

  loadProducts(): void {
    let creatorFilter: string | undefined = undefined;
    
    if (this.isProductUser && !this.isAdmin && this.username) {
      // PRODUCT_USER can only see their own products to check status
      creatorFilter = this.username;
    }

    this.productService.getProducts(creatorFilter).subscribe({
      next: (data) => {
        // Filter out null entries
        this.products = data.filter(p => p.name && p.price > 0);
        this.totalProducts = this.products.length;
        this.applyFilter();
      },
      error: (err) => {
        console.error('Failed to load products', err);
        // Fallback Mock Data
        this.products = [
          { id: 1, name: 'Quantum Watch', description: 'Next-gen smart wearable', price: 299.99, category: 'Electronics', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', stock: 15, status: 'APPROVED' },
          { id: 2, name: 'Aero-Mesh Sneakers', description: 'Hyper-breathable sports footwear', price: 120.00, category: 'Footwear', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', stock: 42, status: 'APPROVED' }
        ];
        this.totalProducts = this.products.length;
        this.applyFilter();
      }
    });
  }

  loadUsers(): void {
    this.http.get<any[]>('https://e-commerce1-e3ny.onrender.com/api/auth/users').subscribe({
      next: (data) => {
        this.usersList = data;
      },
      error: (err) => {
        console.warn('Failed to load users from auth service, using local mock.', err);
        this.usersList = [
          { id: 1, username: 'admin', email: 'admin@gmail.com', role: 'admin', approved: true },
          { id: 13, username: 'user1', email: 'user1@gmail.com', role: 'ROLE_USER', approved: true },
          { id: 14, username: 'user2', email: 'user2@gmail.com', role: 'ROLE_USER', approved: false },
          { id: 15, username: 'user3', email: 'user3@gmail.com', role: 'PRODUCT_USER', approved: false }
        ];
      }
    });
  }

  loadAllOrders(): void {
    this.http.get<any[]>('https://e-commerce1-e3ny.onrender.com/api/orders').subscribe({
      next: (data) => {
        this.allOrders = data.sort((a, b) => b.id - a.id);
      },
      error: (err) => {
        console.warn('Failed to load orders from order service, using local mock.', err);
        this.allOrders = [
          { id: 101, username: 'user1', totalAmount: 49.99, productsDescription: '1x Mechanical Keyboard', status: 'PENDING', orderDate: new Date() },
          { id: 102, username: 'user2', totalAmount: 199.99, productsDescription: '1x Studio Headset', status: 'APPROVED', orderDate: new Date() }
        ];
      }
    });
  }

  approveOrder(orderId: number): void {
    this.http.put(`https://e-commerce1-e3ny.onrender.com/api/orders/${orderId}/status?status=APPROVED`, {}).subscribe({
      next: () => {
        this.loadAllOrders();
        if (this.selectedOrderForApproval && this.selectedOrderForApproval.id === orderId) {
          this.selectedOrderForApproval.status = 'APPROVED';
        }
      },
      error: () => {
        const order = this.allOrders.find(o => o.id === orderId);
        if (order) {
          order.status = 'APPROVED';
        }
        if (this.selectedOrderForApproval && this.selectedOrderForApproval.id === orderId) {
          this.selectedOrderForApproval.status = 'APPROVED';
        }
      }
    });
  }

  rejectOrder(orderId: number): void {
    this.http.put(`https://e-commerce1-e3ny.onrender.com/api/orders/${orderId}/status?status=REJECTED`, {}).subscribe({
      next: () => {
        this.loadAllOrders();
        if (this.selectedOrderForApproval && this.selectedOrderForApproval.id === orderId) {
          this.selectedOrderForApproval.status = 'REJECTED';
        }
      },
      error: () => {
        const order = this.allOrders.find(o => o.id === orderId);
        if (order) {
          order.status = 'REJECTED';
        }
        if (this.selectedOrderForApproval && this.selectedOrderForApproval.id === orderId) {
          this.selectedOrderForApproval.status = 'REJECTED';
        }
      }
    });
  }

  openOrderApprovalDetails(order: any): void {
    this.selectedOrderForApproval = order;
    this.displayOrderDetailsDialog = true;
  }

  getPendingOrders(): any[] {
    return this.allOrders.filter(o => o.status === 'PENDING');
  }

  approveUser(userId: number, selectRole: string): void {
    this.http.put(`https://e-commerce1-e3ny.onrender.com/api/auth/users/${userId}/approve?role=${selectRole}`, {}).subscribe({
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
        alert('User approved (local state synced)');
      }
    });
  }

  approveProduct(product: Product): void {
    if (product.id) {
      const updated = { ...product, status: 'APPROVED' };
      this.productService.updateProduct(product.id, updated).subscribe({
        next: () => {
          this.loadProducts();
        },
        error: () => {
          product.status = 'APPROVED';
          this.applyFilter();
        }
      });
    }
  }

  rejectProduct(product: Product): void {
    if (product.id) {
      const updated = { ...product, status: 'REJECTED' };
      this.productService.updateProduct(product.id, updated).subscribe({
        next: () => {
          this.loadProducts();
        },
        error: () => {
          product.status = 'REJECTED';
          this.applyFilter();
        }
      });
    }
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.displayLimit = 12;
    this.applyFilter();
  }

  applyFilter(): void {
    let temp = [...this.products];
    if (this.selectedCategory !== 'All') {
      temp = temp.filter(p => p.category?.toLowerCase() === this.selectedCategory.toLowerCase());
    }
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      temp = temp.filter(p => p.name?.toLowerCase().includes(query) || p.description?.toLowerCase().includes(query));
    }
    
    // Sorting implementation
    if (this.sortOption === 'priceAsc') {
      temp.sort((a, b) => a.price - b.price);
    } else if (this.sortOption === 'priceDesc') {
      temp.sort((a, b) => b.price - a.price);
    } else if (this.sortOption === 'nameAsc') {
      temp.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    this.hasMoreProducts = temp.length > this.displayLimit;
    this.filteredProducts = temp.slice(0, this.displayLimit);
  }

  loadMore(): void {
    this.displayLimit += 12;
    this.applyFilter();
  }

  openProductDetails(product: Product): void {
    this.selectedDetailProduct = product;
    this.displayDetailsDialog = true;
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
    
    // Trigger Bounce & Flying Badge animation
    this.animatedProductId = product.id || null;
    this.cartAnimating = true;
    
    setTimeout(() => {
      this.cartAnimating = false;
      this.animatedProductId = null;
    }, 1200);
  }

  openNewProductDialog(): void {
    this.isEditMode = false;
    this.editingProductId = undefined;
    this.resetNewProduct();
    this.displayDialog = true;
  }

  editProduct(product: Product): void {
    this.isEditMode = true;
    this.editingProductId = product.id;
    this.newProduct = { ...product };
    this.displayDialog = true;
  }

  deleteProduct(product: Product): void {
    if (product.id) {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => {
          this.products = this.products.filter(p => p.id !== product.id);
          this.totalProducts = this.products.length;
          this.applyFilter();
        },
        error: () => {
          // Fallback delete locally
          this.products = this.products.filter(p => p.id !== product.id);
          this.totalProducts = this.products.length;
          this.applyFilter();
        }
      });
    }
  }

  saveProduct(): void {
    if (this.username) {
      this.newProduct.createdBy = this.username;
    }
    
    // Default product status rules
    if (this.isEditMode) {
      // Keep existing status
    } else {
      // Auto-approve if admin adds it, otherwise status is pending review
      this.newProduct.status = this.isAdmin ? 'APPROVED' : 'PENDING';
    }

    if (this.isEditMode && this.editingProductId !== undefined) {
      this.productService.updateProduct(this.editingProductId, this.newProduct).subscribe({
        next: (updatedProduct) => {
          const index = this.products.findIndex(p => p.id === this.editingProductId);
          if (index !== -1) {
            this.products[index] = updatedProduct;
          }
          this.displayDialog = false;
          this.resetNewProduct();
          this.applyFilter();
        },
        error: () => {
          // Fallback update locally
          const index = this.products.findIndex(p => p.id === this.editingProductId);
          if (index !== -1) {
            this.products[index] = { ...this.newProduct, id: this.editingProductId };
          }
          this.displayDialog = false;
          this.resetNewProduct();
          this.applyFilter();
        }
      });
    } else {
      this.productService.createProduct(this.newProduct).subscribe({
        next: (product) => {
          this.products.push(product);
          this.totalProducts = this.products.length;
          this.displayDialog = false;
          this.resetNewProduct();
          this.applyFilter();
        },
        error: (err) => {
          console.warn('Saving failed, adding locally.');
          const mockProduct = { ...this.newProduct, id: Math.floor(Math.random() * 1000) + 100 };
          this.products.push(mockProduct);
          this.totalProducts = this.products.length;
          this.displayDialog = false;
          this.resetNewProduct();
          this.applyFilter();
        }
      });
    }
  }

  resetNewProduct(): void {
    this.newProduct = {
      name: '',
      description: '',
      price: 0,
      category: 'Electronics',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
      stock: 10,
      status: 'PENDING'
    };
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  scrollToCatalog(): void {
    const element = document.getElementById('catalog-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  subscribeEmail: string = '';

  subscribeMock(): void {
    if (this.subscribeEmail.trim().length > 3) {
      alert(`Thank you for subscribing to the Sandy Cart newsletter: ${this.subscribeEmail}`);
      this.subscribeEmail = '';
    } else {
      alert('Please enter a valid email address.');
    }
  }
}
