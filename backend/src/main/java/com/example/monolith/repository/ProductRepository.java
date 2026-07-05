package com.example.monolith.repository;

import com.example.monolith.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCreatedBy(String createdBy);
}
