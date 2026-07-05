package com.example.monolith.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @PostMapping("/process")
    public ResponseEntity<?> processPayment(@RequestBody Map<String, Object> request) {
        // Mock success transaction simulation
        String orderId = request.containsKey("orderId") ? request.get("orderId").toString() : "N/A";
        Double amount = request.containsKey("amount") ? Double.valueOf(request.get("amount").toString()) : 0.0;
        
        return ResponseEntity.ok(Map.of(
            "transactionId", "TXN-" + System.currentTimeMillis(),
            "status", "SUCCESS",
            "message", "Payment of $" + amount + " successfully processed for Order ID: " + orderId
        ));
    }
}
