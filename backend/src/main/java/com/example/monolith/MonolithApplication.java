package com.example.monolith;

import com.example.monolith.model.Product;
import com.example.monolith.model.User;
import com.example.monolith.repository.ProductRepository;
import com.example.monolith.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.Arrays;
import java.util.List;

@SpringBootApplication
public class MonolithApplication {

    public static void main(String[] args) {
        SpringApplication.run(MonolithApplication.class, args);
    }

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository, ProductRepository productRepository) {
        return args -> {
            // Seed base admin user if not present
            if (userRepository.findByUsername("admin") == null) {
                userRepository.save(new User(null, "admin", "admin@ecommerce.com", "admin", "ROLE_ADMIN", true));
            }
            if (userRepository.findByUsername("user") == null) {
                userRepository.save(new User(null, "user", "user@ecommerce.com", "user", "ROLE_USER", true));
            }

            // Always refresh admin-seeded products to make sure they are clean, full-filled and professional
            List<Product> oldAdminProducts = productRepository.findByCreatedBy("admin");
            productRepository.deleteAll(oldAdminProducts);

            productRepository.saveAll(Arrays.asList(
                // ELECTRONICS
                new Product(null, "X-Pro Wireless Gaming Mouse", "High-precision 26K DPI optical sensor gaming mouse with zero-latency wireless tech and custom RGB.", "Electronics", 89.99, 50, "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500", "APPROVED", "admin"),
                new Product(null, "SonicBoom Portable Speaker", "Waterproof Bluetooth 5.3 rugged outdoor speaker with deep extra bass, dual drivers, and 24-hour playback.", "Electronics", 59.50, 30, "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500", "APPROVED", "admin"),
                new Product(null, "AuraFit Smart Fitness Watch", "Premium AMOLED display smartwatch with active heart GPS, blood-oxygen monitoring, and sleep staging tracking.", "Electronics", 129.99, 45, "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500", "APPROVED", "admin"),
                new Product(null, "Nebula Ultra Projector", "Smart portable 4K UHD home theater projector with built-in Android TV, auto-focus, and immersive Dolby Audio speakers.", "Electronics", 449.00, 15, "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=500", "APPROVED", "admin"),
                new Product(null, "KeyForge Mechanical Keyboard", "Hot-swappable tactile blue switches mechanical keyboard featuring keycaps customization and an elegant metal body.", "Electronics", 109.99, 25, "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500", "APPROVED", "admin"),
                new Product(null, "Luna Wireless Headset", "Over-ear noise-cancelling wireless audiophile headphones featuring custom acoustic drivers and spatial audio.", "Electronics", 199.99, 20, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500", "APPROVED", "admin"),
                
                // APPAREL
                new Product(null, "Alpha-Knit Running Shoes", "Extremely flexible, lightweight running sneakers featuring breathable knit upper mesh and shock-absorbent outsoles.", "Apparel", 95.00, 40, "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500", "APPROVED", "admin"),
                new Product(null, "Urban Utility Backpack", "Heavy-duty waterproof travel backpack with padded 16-inch laptop compartment, quick-access pockets and USB charging slot.", "Apparel", 68.50, 60, "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500", "APPROVED", "admin"),
                new Product(null, "Classic Denim Jacket", "Premium washed blue organic cotton denim jacket with secure double-stitch chest pockets and button closures.", "Apparel", 79.99, 35, "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500", "APPROVED", "admin"),
                new Product(null, "Essential Crewneck Sweater", "Luxury ultra-soft merino wool pullover sweater offering premium warmth and minimalist classic design.", "Apparel", 55.00, 50, "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500", "APPROVED", "admin"),
                
                // ACCESSORIES
                new Product(null, "AeroShield Sunglasses", "Polarized UV400 protective everyday sunglasses crafted with ultralight aircraft-grade aluminum alloy frames.", "Accessories", 45.00, 80, "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500", "APPROVED", "admin"),
                new Product(null, "Nova Chronograph Watch", "Timeless luxury analog stainless steel wristwatch featuring sapphire glass, stopwatch dials, and premium leather straps.", "Accessories", 189.00, 18, "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500", "APPROVED", "admin")
            ));
        };
    }
}
