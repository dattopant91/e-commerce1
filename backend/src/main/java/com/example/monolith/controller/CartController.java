package com.example.monolith.controller;

import com.example.monolith.model.CartItem;
import com.example.monolith.repository.CartItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartItemRepository cartItemRepository;

    @GetMapping("/{username}")
    public ResponseEntity<List<CartItem>> getCart(@PathVariable String username) {
        return ResponseEntity.ok(cartItemRepository.findByUsername(username));
    }

    @PostMapping
    public ResponseEntity<?> addToCart(@RequestBody CartItem item) {
        Optional<CartItem> existing = cartItemRepository.findByUsernameAndProductId(item.getUsername(), item.getProductId());
        if (existing.isPresent()) {
            CartItem cartItem = existing.get();
            cartItem.setQuantity(cartItem.getQuantity() + item.getQuantity());
            return ResponseEntity.ok(cartItemRepository.save(cartItem));
        } else {
            return ResponseEntity.ok(cartItemRepository.save(item));
        }
    }

    @PutMapping("/update")
    @Transactional
    public ResponseEntity<?> updateQuantity(@RequestBody Map<String, Object> payload) {
        String username = (String) payload.get("username");
        Long productId = Long.valueOf(payload.get("productId").toString());
        Integer quantity = (Integer) payload.get("quantity");

        Optional<CartItem> existing = cartItemRepository.findByUsernameAndProductId(username, productId);
        if (existing.isPresent()) {
            CartItem cartItem = existing.get();
            if (quantity <= 0) {
                cartItemRepository.delete(cartItem);
                return ResponseEntity.ok(Map.of("message", "Item removed from cart"));
            } else {
                cartItem.setQuantity(quantity);
                return ResponseEntity.ok(cartItemRepository.save(cartItem));
            }
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{username}/product/{productId}")
    @Transactional
    public ResponseEntity<?> removeFromCart(@PathVariable String username, @PathVariable Long productId) {
        Optional<CartItem> existing = cartItemRepository.findByUsernameAndProductId(username, productId);
        if (existing.isPresent()) {
            cartItemRepository.delete(existing.get());
            return ResponseEntity.ok(Map.of("message", "Item removed successfully"));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{username}")
    @Transactional
    public ResponseEntity<?> clearCart(@PathVariable String username) {
        cartItemRepository.deleteByUsername(username);
        return ResponseEntity.ok(Map.of("message", "Cart cleared successfully"));
    }
}
