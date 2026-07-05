import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  private cartUrl = 'http://localhost:8080/api/cart';

  cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initCart();
  }

  private getUsername(): string | null {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        return JSON.parse(userStr).username;
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  initCart(): void {
    const username = this.getUsername();
    if (username) {
      this.loadCartFromDb(username);
    } else {
      // Load guest cart from memory or local storage
      const localCart = localStorage.getItem('guestCart');
      if (localCart) {
        this.cartItems = JSON.parse(localCart);
        this.cartSubject.next([...this.cartItems]);
      }
    }
  }

  private loadCartFromDb(username: string): void {
    this.http.get<any[]>(`${this.cartUrl}/${username}`).subscribe({
      next: (dbItems) => {
        this.cartItems = dbItems.map(item => ({
          product: {
            id: item.productId,
            name: item.productName,
            description: '',
            price: item.price,
            category: '',
            imageUrl: item.imageUrl,
            stock: 99
          },
          quantity: item.quantity
        }));
        this.cartSubject.next([...this.cartItems]);
      },
      error: () => {
        console.warn('Failed to load persisted cart from database.');
      }
    });
  }

  addToCart(product: Product): void {
    const username = this.getUsername();
    
    if (username && product.id) {
      // Post to database persisted cart
      const payload = {
        username: username,
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: 1,
        imageUrl: product.imageUrl
      };
      
      this.http.post(`${this.cartUrl}`, payload).subscribe({
        next: () => {
          this.loadCartFromDb(username);
        },
        error: () => {
          this.addToLocalCart(product);
        }
      });
    } else {
      this.addToLocalCart(product);
    }
  }

  private addToLocalCart(product: Product): void {
    const existing = this.cartItems.find(item => item.product.id === product.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.cartItems.push({ product, quantity: 1 });
    }
    localStorage.setItem('guestCart', JSON.stringify(this.cartItems));
    this.cartSubject.next([...this.cartItems]);
  }

  updateQuantity(productId: number, quantity: number): void {
    const username = this.getUsername();
    if (username) {
      const payload = {
        username: username,
        productId: productId,
        quantity: quantity
      };
      this.http.put(`${this.cartUrl}/update`, payload).subscribe({
        next: () => {
          this.loadCartFromDb(username);
        }
      });
    } else {
      const item = this.cartItems.find(i => i.product.id === productId);
      if (item) {
        item.quantity = quantity;
        if (item.quantity <= 0) {
          this.cartItems = this.cartItems.filter(i => i.product.id !== productId);
        }
        localStorage.setItem('guestCart', JSON.stringify(this.cartItems));
        this.cartSubject.next([...this.cartItems]);
      }
    }
  }

  removeFromCart(productId: number): void {
    const username = this.getUsername();
    if (username) {
      this.http.delete(`${this.cartUrl}/${username}/product/${productId}`).subscribe({
        next: () => {
          this.loadCartFromDb(username);
        }
      });
    } else {
      this.cartItems = this.cartItems.filter(item => item.product.id !== productId);
      localStorage.setItem('guestCart', JSON.stringify(this.cartItems));
      this.cartSubject.next([...this.cartItems]);
    }
  }

  getCartItems(): CartItem[] {
    return this.cartItems;
  }

  clearCart(): void {
    const username = this.getUsername();
    if (username) {
      this.http.delete(`${this.cartUrl}/${username}`).subscribe({
        next: () => {
          this.cartItems = [];
          this.cartSubject.next([]);
        }
      });
    } else {
      this.cartItems = [];
      localStorage.removeItem('guestCart');
      this.cartSubject.next([]);
    }
  }

  getTotal(): number {
    return this.cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }
}
