package com.example.monolith.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private Double totalAmount;
    private String productsDescription; // Comma separated items summary
    private String status; // "PENDING", "APPROVED", "REJECTED", "PAID"
    private String address; // Shipping delivery address
    private LocalDateTime orderDate;
}
