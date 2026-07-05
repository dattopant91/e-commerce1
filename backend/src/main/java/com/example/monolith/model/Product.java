package com.example.monolith.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private String category;
    private Double price;
    private Integer stock;
    private String imageUrl;
    private String status; // "PENDING", "APPROVED", "REJECTED"
    private String createdBy; // username of creator
}
