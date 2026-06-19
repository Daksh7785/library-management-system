# Release Notes: v1.0.0-SNAPSHOT

Welcome to the official release of the Java Spring Boot Library Management System! This release marks the completion of the migration from a legacy hybrid configuration to a 100% Java-friendly enterprise backend with Thymeleaf templates.

---

## Key Highlights

### 1. Pure Java & Maven Architecture
* **Java 21 Upgrade**: Targets modern LTS features and ensures JDK 25 compatibility.
* **Lombok Removal**: Replaced all Lombok dependency features with standard Java patterns (explicit encapsulation and builder classes) to resolve annotation processor failures on JDK 25.
* **Maven Wrapper Integration**: Bundled Maven Wrapper (`mvnw` and `mvnw.cmd`) for zero-install, repeatable builds.

### 2. Enhanced JPA Entity Layer
* Added explicit `@Column` constraint mapping (precision, length, nullability) to all database models (`Book`, `BookCopy`, `Profile`, `Transaction`).
* Introduced Jakarta Bean Validation (`@NotBlank`, `@Email`, `@Min`, `@DecimalMin`) for server-side verification of fields.
* Refactored `Transaction` model date fields from `String` to standard `LocalDate`.

### 3. Service Layer Abstraction
* Created `BookService`, `ProfileService`, and `TransactionService` to isolate database transactions and business rules from web routing controllers.

### 4. Robust Controller & DTO Refactoring
* Replaced direct repository access in `ActionController`, `AuthController`, `BookController`, and `ViewController` with service layer delegators.
* Introduced structured request/response DTOs: `SignupRequest`, `DemoLoginRequest`, and `AuthResponse`.

### 5. Centralized Exception Handling
* Configured `GlobalExceptionHandler` with `@ControllerAdvice` to intercept errors across all endpoints and return standardized JSON objects.
* Added custom domain exception classes: `ResourceNotFoundException` (HTTP 404) and `DuplicateResourceException` (HTTP 409).

### 6. Profile-Based Configuration
* Created profile-driven setup with `application-dev.properties` (pre-configured for H2 in-memory storage) and `application-prod.properties.example` (PostgreSQL setup).

---

## Setup & Running

Please refer to the updated [README.md](file:///c:/Users/ASUS/Desktop/librarymangementsystem/README.md) for full setup instructions.

* Run in Dev Mode:
  ```bash
  .\mvnw.cmd spring-boot:run
  ```
* H2 Console: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
