package com.example.monolith;

import com.example.monolith.model.Product;
import com.example.monolith.model.User;
import com.example.monolith.repository.ProductRepository;
import com.example.monolith.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Arrays;

@SpringBootApplication
public class MonolithApplication {

    public static void main(String[] args) {
        SpringApplication.run(MonolithApplication.class, args);
    }

    @Bean
    public CommandLineRunner seedData(UserRepository userRepository, ProductRepository productRepository, PasswordEncoder encoder) {
        return args -> {
            // Seed Admin if not exists
            if (userRepository.findByUsername("admin").isEmpty()) {
                User admin = new User(null, "admin", "admin@gmail.com", encoder.encode("admin"), "admin", true);
                userRepository.save(admin);
            }

            // Seed sample customers & vendors if empty
            if (userRepository.count() <= 1) {
                User customer = new User(null, "user1", "user1@gmail.com", encoder.encode("password"), "ROLE_USER", true);
                User vendor = new User(null, "vendor1", "vendor1@gmail.com", encoder.encode("password"), "PRODUCT_USER", true);
                User pendingUser = new User(null, "newuser", "new@gmail.com", encoder.encode("password"), "ROLE_USER", false);
                
                userRepository.saveAll(Arrays.asList(customer, vendor, pendingUser));

                // Add 10 dummy users to meet request
                for (int i = 1; i <= 10; i++) {
                    User dummy = new User(null, "dummycustomer" + i, "dummy" + i + "@gmail.com", encoder.encode("password"), "ROLE_USER", true);
                    userRepository.save(dummy);
                }
            }

            // Seed sample products if empty
            if (productRepository.count() == 0) {
                productRepository.saveAll(Arrays.asList(
                    new Product(null, "Quantum Watch", "Next-gen smartwatch with AMOLED display and 14-day battery life.", "Electronics", 129.99, 45, "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500", "APPROVED", "admin"),
                    new Product(null, "Aero-Mesh Sneakers", "High-performance breathable running shoes with ultra-comfort foam.", "Apparel", 89.99, 60, "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500", "APPROVED", "admin"),
                    new Product(null, "Luna Headset", "Noise-cancelling wireless audiophile headphones with spatial sound.", "Electronics", 199.99, 25, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500", "APPROVED", "admin"),
                    new Product(null, "Pro DSLR Camera", "Professional 24MP full-frame DSLR camera with 24-70mm lens bundle.", "Electronics", 899.99, 8, "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500", "APPROVED", "admin"),
                    new Product(null, "Smart Home Hub", "Voice-controlled display hub to automate lights, temperature, security.", "Electronics", 120.00, 15, "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=500", "APPROVED", "admin"),
                    new Product(null, "Premium Leather Wallet", "Handcrafted genuine leather bi-fold wallet with RFID blocker slots.", "Accessories", 39.99, 110, "https://images.unsplash.com/photo-1627123424574-724758594e93?w=500", "APPROVED", "admin")
                ));

                // Add 20 more dummy products to have a rich dashboard catalog
                for (int i = 1; i <= 25; i++) {
                    productRepository.save(new Product(
                        null, 
                        "Gizmo Gadget " + i, 
                        "Useful multi-functional smart device variant " + i + " to ease daily productivity.", 
                        "Electronics", 
                        15.00 + (i * 3.5), 
                        10 + (i * 2), 
                        "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=500", 
                        "APPROVED", 
                        "admin"
                    ));
                }
            }
        };
    }
}
