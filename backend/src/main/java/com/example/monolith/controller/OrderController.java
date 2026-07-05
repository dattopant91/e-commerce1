package com.example.monolith.controller;

import com.example.monolith.model.CartItem;
import com.example.monolith.model.Order;
import com.example.monolith.model.Product;
import com.example.monolith.repository.CartItemRepository;
import com.example.monolith.repository.OrderRepository;
import com.example.monolith.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api")
public class OrderController {

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    // --- CART ENDPOINTS ---
    @GetMapping("/cart")
    public ResponseEntity<List<CartItem>> getCartItems(@RequestParam String username) {
        return ResponseEntity.ok(cartItemRepository.findByUsername(username));
    }

    @PostMapping("/cart")
    public ResponseEntity<CartItem> addToCart(@RequestBody CartItem item) {
        Optional<CartItem> opt = cartItemRepository.findByUsernameAndProductId(item.getUsername(), item.getProductId());
        if (opt.isPresent()) {
            CartItem existing = opt.get();
            existing.setQuantity(existing.getQuantity() + item.getQuantity());
            return ResponseEntity.ok(cartItemRepository.save(existing));
        } else {
            return ResponseEntity.ok(cartItemRepository.save(item));
        }
    }

    @DeleteMapping("/cart/{itemId}")
    public ResponseEntity<?> removeCartItem(@PathVariable Long itemId) {
        cartItemRepository.deleteById(itemId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/cart")
    @Transactional
    public ResponseEntity<?> clearCart(@RequestParam String username) {
        cartItemRepository.deleteByUsername(username);
        return ResponseEntity.ok().build();
    }

    // --- ORDER ENDPOINTS ---
    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getOrders(@RequestParam(required = false) String username) {
        if (username != null && !username.isEmpty()) {
            return ResponseEntity.ok(orderRepository.findByUsername(username));
        }
        return ResponseEntity.ok(orderRepository.findAll());
    }

    @PostMapping("/orders")
    @Transactional
    public ResponseEntity<?> placeOrder(@RequestBody Map<String, Object> payload) {
        String username = (String) payload.get("username");
        Double totalAmount = Double.valueOf(payload.get("totalAmount").toString());
        String productsDescription = (String) payload.get("productsDescription");

        Order order = new Order();
        order.setUsername(username);
        order.setTotalAmount(totalAmount);
        order.setProductsDescription(productsDescription);
        order.setStatus("PENDING");
        order.setOrderDate(LocalDateTime.now());
        
        Order saved = orderRepository.save(order);

        // Process cart items (decrement stock and clear cart)
        List<CartItem> cartItems = cartItemRepository.findByUsername(username);
        for (CartItem item : cartItems) {
            Optional<Product> optProduct = productRepository.findById(item.getProductId());
            if (optProduct.isPresent()) {
                Product prod = optProduct.get();
                int newStock = prod.getStock() - item.getQuantity();
                prod.setStock(Math.max(0, newStock));
                productRepository.save(prod);
            }
            cartItemRepository.delete(item);
        }

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestParam String status) {
        Optional<Order> opt = orderRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Order order = opt.get();
        order.setStatus(status.toUpperCase());
        orderRepository.save(order);

        return ResponseEntity.ok(Map.of("message", "Order status updated successfully"));
    }
}
