# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0-SNAPSHOT] - 2026-06-19

### Added
- **Maven Wrapper**: Bundled `mvnw` and `mvnw.cmd` for zero-install project building.
- **Jakarta Bean Validation**: Integrated validation constraints (`@NotBlank`, `@Email`, etc.) on both entities and incoming request bodies.
- **Service Layer**: Introduced `BookService`, `ProfileService`, and `TransactionService` to isolate database transactions from controller logic.
- **Custom Exceptions**: Added `ResourceNotFoundException` and `DuplicateResourceException` for clean state verification.
- **Global Error Interception**: Added `GlobalExceptionHandler` with `@ControllerAdvice` to format exception returns into standard JSON format.
- **Request/Response DTOs**: Added `SignupRequest`, `DemoLoginRequest`, and `AuthResponse` classes.
- **Profile configurations**: Added `application-dev.properties` (H2 database setup) and `application-prod.properties.example` (PostgreSQL setup).

### Changed
- **Java Platform**: Upgraded source/target JDK level to Java 21 for modern features.
- **Spring Boot Platform**: Upgraded Parent POM to Spring Boot version 3.3.5.
- **Entities**: Refactored `Book`, `BookCopy`, `Profile`, and `Transaction` to use native builders and properties instead of Lombok annotations to ensure JDK 25 compatibility.
- **Transaction Dates**: Updated transaction date properties (`issueDate`, `dueDate`, `returnDate`) from `String` type to `LocalDate`.
- **Controllers**: Refactored `ActionController`, `AuthController`, `BookController`, and `ViewController` to call service layers and use constructor injection.
- **Git Workspace Ignore rules**: Configured `.gitignore` to block IDE, Maven cache, and build outputs, as well as legacy JS frontend files (`node_modules/`, `.vite/`, `dist/`).

### Removed
- **Lombok dependency**: Completely removed `@Data`, `@Builder`, and other annotations to support all Java compilations (JDK 17 to JDK 25) seamlessly.
