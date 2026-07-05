package com.example.monolith.controller;

import com.example.monolith.model.User;
import com.example.monolith.repository.UserRepository;
import com.example.monolith.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username is already taken"));
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        // Admin is auto-approved, other users default to pending approval
        if ("admin".equalsIgnoreCase(user.getUsername()) || "admin".equalsIgnoreCase(user.getRole())) {
            user.setRole("admin");
            user.setApproved(true);
        } else {
            if (user.getRole() == null || user.getRole().isEmpty()) {
                user.setRole("ROLE_USER");
            }
            user.setApproved(false);
        }

        User saved = userRepository.save(user);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        Optional<User> optUser = userRepository.findByUsername(username);
        if (optUser.isEmpty() || !passwordEncoder.matches(password, optUser.get().getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid credentials"));
        }

        User user = optUser.get();
        if (!user.isApproved()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Your account is pending approval by the Admin."));
        }

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole());
        return ResponseEntity.ok(Map.of(
            "token", token,
            "username", user.getUsername(),
            "role", user.getRole(),
            "email", user.getEmail() != null ? user.getEmail() : ""
        ));
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PutMapping("/users/{userId}/approve")
    public ResponseEntity<?> approveUser(@PathVariable Long userId, @RequestParam String role) {
        Optional<User> optUser = userRepository.findById(userId);
        if (optUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = optUser.get();
        user.setApproved(true);
        user.setRole(role);
        userRepository.save(user);
        
        return ResponseEntity.ok(Map.of("message", "User approved successfully"));
    }
}
