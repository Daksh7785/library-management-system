package com.academicos;

import com.academicos.model.Book;
import com.academicos.model.BookCopy;
import com.academicos.model.Profile;
import com.academicos.repository.BookCopyRepository;
import com.academicos.repository.BookRepository;
import com.academicos.repository.ProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class Application {

    private static final Logger log = LoggerFactory.getLogger(Application.class);

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Bean
    public CommandLineRunner seedDemoData(
            BookRepository bookRepository,
            ProfileRepository profileRepository,
            BookCopyRepository bookCopyRepository) {
        return args -> {

            // ── Seed Profiles ──────────────────────────────────────────────
            if (profileRepository.count() == 0) {
                profileRepository.save(Profile.builder()
                        .id("demo-student-id").email("student@demo.academic.com")
                        .fullName("Demo Student").role("student").xp(1200).streakDays(5).maxLimit(3).build());
                profileRepository.save(Profile.builder()
                        .id("demo-teacher-id").email("teacher@demo.academic.com")
                        .fullName("Demo Teacher").role("teacher").xp(2500).streakDays(12).maxLimit(10).build());
                profileRepository.save(Profile.builder()
                        .id("demo-admin-id").email("admin@demo.academic.com")
                        .fullName("System Admin").role("admin").xp(9999).streakDays(42).maxLimit(99).build());
                log.info("✅ Demo profiles seeded");
            }

            // ── Seed Books ─────────────────────────────────────────────────
            if (bookRepository.count() == 0) {
                bookRepository.save(Book.builder()
                        .id("book-1").title("Quantum Physics: A Modern Introduction")
                        .author("Dr. Elizabeth Vance").isbn("9780131118928")
                        .description("A comprehensive guide to quantum mechanics and wave-particle duality.")
                        .coverUrl("https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=400&q=80")
                        .category("Physics").rating(4.8).reviewsCount(12)
                        .publishedYear(2021).totalPages(540).language("en").available(true).build());

                bookRepository.save(Book.builder()
                        .id("book-2").title("Artificial Intelligence: Foundations & Agents")
                        .author("Prof. Arthur Pendelton").isbn("9780262033848")
                        .description("Explore machine learning core algorithms and intelligent agent architectures.")
                        .coverUrl("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80")
                        .category("Computer Science").rating(4.9).reviewsCount(38)
                        .publishedYear(2023).totalPages(820).language("en").available(true).build());

                bookRepository.save(Book.builder()
                        .id("book-3").title("Introduction to Algorithms")
                        .author("Thomas H. Cormen").isbn("9780262033849")
                        .description("The definitive textbook on algorithms and data structures.")
                        .coverUrl("https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=400&q=80")
                        .category("Computer Science").rating(4.7).reviewsCount(56)
                        .publishedYear(2009).totalPages(1292).language("en").available(true).build());

                bookRepository.save(Book.builder()
                        .id("book-4").title("Clean Code: A Handbook of Agile Software Craftsmanship")
                        .author("Robert C. Martin").isbn("9780132350884")
                        .description("Best practices for writing maintainable, readable Java code.")
                        .coverUrl("https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80")
                        .category("Software Engineering").rating(4.6).reviewsCount(110)
                        .publishedYear(2008).totalPages(431).language("en").available(true).build());

                bookRepository.save(Book.builder()
                        .id("book-5").title("Effective Java")
                        .author("Joshua Bloch").isbn("9780134685991")
                        .description("Best practices for the Java platform from a language architect.")
                        .coverUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80")
                        .category("Java").rating(4.9).reviewsCount(204)
                        .publishedYear(2018).totalPages(412).language("en").available(true).build());

                log.info("✅ Book catalog seeded with {} books", bookRepository.count());
            }

            // ── Seed Book Copies ───────────────────────────────────────────
            if (bookCopyRepository.count() == 0) {
                bookCopyRepository.save(BookCopy.builder().id("copy-1-1").bookId("book-1").qrCode("QR-PHY-001").conditionScore(95).status("available").locationShelf("Shelf A-1").build());
                bookCopyRepository.save(BookCopy.builder().id("copy-1-2").bookId("book-1").qrCode("QR-PHY-002").conditionScore(80).status("available").locationShelf("Shelf A-1").build());
                bookCopyRepository.save(BookCopy.builder().id("copy-2-1").bookId("book-2").qrCode("QR-CS-001").conditionScore(98).status("available").locationShelf("Shelf B-3").build());
                bookCopyRepository.save(BookCopy.builder().id("copy-3-1").bookId("book-3").qrCode("QR-ALG-001").conditionScore(90).status("available").locationShelf("Shelf B-4").build());
                bookCopyRepository.save(BookCopy.builder().id("copy-4-1").bookId("book-4").qrCode("QR-SE-001").conditionScore(92).status("available").locationShelf("Shelf C-1").build());
                bookCopyRepository.save(BookCopy.builder().id("copy-5-1").bookId("book-5").qrCode("QR-JAVA-001").conditionScore(97).status("available").locationShelf("Shelf C-2").build());
                log.info("✅ Book copies seeded with {} copies", bookCopyRepository.count());
            }

            log.info("🚀 AcademicOS started — http://localhost:8080");
        };
    }
}
