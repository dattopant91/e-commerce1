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

            java.util.List<Product> productsToSeed = new java.util.ArrayList<>();

            // 1. ELECTRONICS: 10 Brands x 8 Items = 80 Products
            String[] elecBrands = {"Sony", "Logitech", "Razer", "Samsung", "Apple", "Anker", "Bose", "Sennheiser", "Asus", "JBL"};
            String[] elecItems = {"Wireless Earbuds", "Gaming Mouse", "Mechanical Keyboard", "Smart Watch", "HD Projector", "Noise-Cancelling Headphones", "Bluetooth Speaker", "USB-C Hub"};
            String[] elecDescs = {
                "High-fidelity immersive audio experience with long battery life.",
                "Ergonomic high-precision tracking and custom gaming performance.",
                "Tactile key feedback mechanical switches with glowing backlight customization.",
                "Smart health monitor tracking heart rate, sleep, and active exercise.",
                "Portable high-definition display projection tool for home cinema.",
                "Over-ear comfortable sound isolating headset for studio and travel.",
                "Rich stereo sound waterproof outdoor speaker with deep bass.",
                "Multi-port expansion docking station for rapid data transfer."
            };
            double[] elecPrices = {129.99, 69.99, 109.99, 199.99, 399.00, 249.99, 49.99, 39.99};
            String[] elecImages = {
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500", // headphones
                "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500", // mouse
                "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500", // keyboard
                "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500", // smartwatch
                "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=500", // projector
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500", // headphones
                "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500", // speaker
                "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=500"  // generic tech
            };

            for (int b = 0; b < elecBrands.length; b++) {
                for (int itemIdx = 0; itemIdx < elecItems.length; itemIdx++) {
                    String name = elecBrands[b] + " " + elecItems[itemIdx];
                    String desc = elecBrands[b] + " " + elecDescs[itemIdx];
                    double price = elecPrices[itemIdx] + (b * 4.5);
                    int stock = 15 + (b * 2);
                    String img = elecImages[itemIdx];
                    productsToSeed.add(new Product(null, name, desc, "Electronics", price, stock, img, "APPROVED", "admin"));
                }
            }

            // 2. APPAREL: 8 Brands x 8 Items = 64 Products
            String[] appBrands = {"Nike", "Adidas", "Puma", "Levis", "Under Armour", "Zara", "Patagonia", "North Face"};
            String[] appItems = {"Running Shoes", "Athletic Socks", "Hoodie Sweatshirt", "Denim Jeans", "Utility Backpack", "Training Tee", "Fleece Jacket", "Puffer Vest"};
            String[] appDescs = {
                "Comfortable high-rebound cushioning athletic sneakers for sports.",
                "Sweat-wicking cushioned performance socks for daily workouts.",
                "Soft organic cotton pullover fleece hooded sweatshirt.",
                "Classic washed organic cotton jeans with reinforced stitching.",
                "Heavy-duty water-resistant travel backpack with laptop compartment.",
                "Lightweight breathable quick-dry athletic training shirt.",
                "Warm insulating zippered soft fleece outdoor jacket.",
                "Windproof insulated utility travel outer vest."
            };
            double[] appPrices = {95.00, 15.99, 59.99, 79.99, 68.50, 24.99, 110.00, 89.00};
            String[] appImages = {
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500", // shoes
                "https://images.unsplash.com/photo-1509585961063-a26105b30819?w=500", // socks
                "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500", // sweater
                "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500", // denim
                "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500", // backpack
                "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500", // tshirt
                "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500", // jacket
                "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500"  // generic apparel
            };

            for (int b = 0; b < appBrands.length; b++) {
                for (int itemIdx = 0; itemIdx < appItems.length; itemIdx++) {
                    String name = appBrands[b] + " " + appItems[itemIdx];
                    String desc = appBrands[b] + " " + appDescs[itemIdx];
                    double price = appPrices[itemIdx] + (b * 3.25);
                    int stock = 20 + (b * 3);
                    String img = appImages[itemIdx];
                    productsToSeed.add(new Product(null, name, desc, "Apparel", price, stock, img, "APPROVED", "admin"));
                }
            }

            // 3. ACCESSORIES: 8 Brands x 10 Items = 80 Products
            String[] accBrands = {"Ray-Ban", "Fossil", "Seiko", "Herschel", "Ridge", "Bellroy", "Oakley", "Casio"};
            String[] accItems = {"Leather Wallet", "Travel Duffel", "Polarized Sunglasses", "Minimalist Cardholder", "Metal Keychain", "Stainless Steel Bottle", "Chronograph Watch", "Leather Belt", "Canvas Cap", "Tech Organizer Case"};
            String[] accDescs = {
                "Handcrafted RFID-blocking bi-fold genuine leather pocket wallet.",
                "Spacious carry-on travel duffel bag with shoulder strap.",
                "UV400 protective lightweight polarized performance sunglasses.",
                "Slim aluminum blocking modern pocket credit card holder.",
                "Heavy-duty quick-release tactical titanium everyday carabiner.",
                "Double-walled vacuum insulated hot/cold travel flask.",
                "Classic stainless steel water-resistant analog chronograph watch.",
                "Premium top-grain classic dress leather belt.",
                "Minimalist organic cotton casual everyday baseball cap.",
                "Padded protective accessory sleeve pouch for cables and chargers."
            };
            double[] accPrices = {45.00, 75.00, 150.00, 35.00, 15.00, 24.99, 189.00, 39.00, 19.99, 29.99};
            String[] accImages = {
                "https://images.unsplash.com/photo-1627123424574-724758594e93?w=500", // wallet
                "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500", // bag
                "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500", // sunglasses
                "https://images.unsplash.com/photo-1627123424574-724758594e93?w=500", // cardholder
                "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500", // keyholder
                "https://images.unsplash.com/photo-1590564313990-98a4d7c9baf4?w=500", // bottle
                "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500", // watch
                "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500", // belt
                "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500", // cap
                "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=500"  // organizer
            };

            for (int b = 0; b < accBrands.length; b++) {
                for (int itemIdx = 0; itemIdx < accItems.length; itemIdx++) {
                    String name = accBrands[b] + " " + accItems[itemIdx];
                    String desc = accBrands[b] + " " + accDescs[itemIdx];
                    double price = accPrices[itemIdx] + (b * 5.0);
                    int stock = 25 + (b * 4);
                    String img = accImages[itemIdx];
                    productsToSeed.add(new Product(null, name, desc, "Accessories", price, stock, img, "APPROVED", "admin"));
                }
            }

            productRepository.saveAll(productsToSeed);
        };
    }
}
