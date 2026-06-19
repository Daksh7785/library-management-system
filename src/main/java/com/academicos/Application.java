package com.academicos;

import com.academicos.model.Book;
import com.academicos.model.Profile;
import com.academicos.repository.BookRepository;
import com.academicos.repository.ProfileRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Bean
    public CommandLineRunner demoData(BookRepository bookRepository, ProfileRepository profileRepository) {
        return args -> {
            // Seed Profiles
            if (profileRepository.count() == 0) {
                profileRepository.save(new Profile("demo-student-id", "student@demo.academic.com", "Demo Student", "student", null, 1200, 5, 3));
                profileRepository.save(new Profile("demo-teacher-id", "teacher@demo.academic.com", "Demo Teacher", "teacher", null, 2500, 12, 10));
                profileRepository.save(new Profile("demo-admin-id", "admin@demo.academic.com", "System Admin", "admin", null, 9999, 42, 100));
                System.out.println("🌱 Database profiles seeded");
            }

            // Seed Books
            if (bookRepository.count() == 0) {
                bookRepository.save(new Book("book-1", "Quantum Physics: A Modern Introduction", "Dr. Elizabeth Vance", "9780131118928", "A comprehensive guide to quantum mechanics.", "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=400&q=80", "Physics", 4.8, 12, 2021, 540, "en", true));
                bookRepository.save(new Book("book-2", "Artificial Intelligence: Foundations & Agents", "Prof. Arthur Pendelton", "9780262033848", "Explore machine learning core algorithms.", "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80", "Computer Science", 4.9, 38, 2023, 820, "en", true));
                bookRepository.save(new Book("book-3", "Introduction to Algorithms", "Thomas H. Cormen", "9780262033849", "The standard textbook on algorithms and structures.", "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=400&q=80", "Computer Science", 4.7, 56, 2009, 1292, "en", true));
                System.out.println("🌱 Database catalog seeded");
            }
        };
    }
}
