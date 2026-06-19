# 📚 AcademicOS — Library Management System

A full-stack **Java 17 + Spring Boot 3** library management application with Thymeleaf server-side rendering, Spring Data JPA, Spring Security, and JWT authentication.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Java 17 |
| Framework | Spring Boot 3.2.2 |
| Web / MVC | Spring MVC + Thymeleaf |
| Persistence | Spring Data JPA + Hibernate |
| Database (Dev) | H2 In-Memory |
| Database (Prod) | PostgreSQL |
| Security | Spring Security + JWT (JJWT 0.11.5) |
| Validation | Jakarta Bean Validation |
| Build Tool | Apache Maven 3.9+ (via Maven Wrapper) |
| Code Reduction | Lombok |

---

## 📁 Project Structure

```
src/
└── main/
    ├── java/com/academicos/
    │   ├── Application.java              # Spring Boot entry point + data seeding
    │   ├── controller/
    │   │   ├── AuthController.java       # REST: /api/auth/**
    │   │   ├── BookController.java       # REST: /api/books/**
    │   │   ├── ActionController.java     # MVC:  /api/action/borrow, /return
    │   │   └── ViewController.java       # MVC:  /login, /dashboard, /books, /profile
    │   ├── dto/
    │   │   ├── AuthResponse.java         # Structured auth response
    │   │   ├── SignupRequest.java        # Signup form request
    │   │   └── DemoLoginRequest.java     # Demo login request
    │   ├── exception/
    │   │   ├── GlobalExceptionHandler.java    # @ControllerAdvice for all errors
    │   │   ├── ResourceNotFoundException.java # HTTP 404
    │   │   └── DuplicateResourceException.java# HTTP 409
    │   ├── model/
    │   │   ├── Book.java
    │   │   ├── BookCopy.java
    │   │   ├── Profile.java
    │   │   └── Transaction.java
    │   ├── repository/
    │   │   ├── BookRepository.java
    │   │   ├── BookCopyRepository.java
    │   │   ├── ProfileRepository.java
    │   │   └── TransactionRepository.java
    │   ├── security/
    │   │   ├── JwtTokenUtil.java
    │   │   └── SecurityConfig.java
    │   └── service/
    │       ├── BookService.java
    │       ├── ProfileService.java
    │       └── TransactionService.java
    └── resources/
        ├── application.properties         # Common config
        ├── application-dev.properties     # H2 dev config (default)
        ├── application-prod.properties.example  # PostgreSQL template
        └── templates/
            ├── login.html
            ├── dashboard.html
            ├── catalog.html
            ├── book-detail.html
            └── profile.html
```

---

## 🚀 Getting Started

### Prerequisites

- **Java 17+** — [Download Temurin](https://adoptium.net/)
- **No Maven installation needed** — Maven Wrapper (`mvnw`) is included

Verify Java:
```bash
java -version
# Expected: openjdk 17 or higher
```

### Run in Development Mode

```bash
# Windows
mvnw.cmd spring-boot:run

# Linux / macOS
./mvnw spring-boot:run
```

The app starts at **http://localhost:8080**

### Build a JAR

```bash
mvnw.cmd clean package -DskipTests

# Run the JAR
java -jar target/library-management-system-1.0.0-SNAPSHOT.jar
```

---

## 🗂️ Features

| Feature | Description |
|---------|-------------|
| 📖 Book Catalog | Browse and search all library books |
| 🔍 Full-Text Search | Search by title, author, or description |
| 📋 Borrow System | Borrow a book → creates a 14-day transaction |
| 🔄 Return System | Return a book → frees the copy, calculates overdue fine |
| 👤 User Profiles | Student / Teacher / Admin roles with XP and streak tracking |
| 🔐 JWT Auth | Stateless JWT token-based authentication |
| ✅ Validation | Bean Validation on all DTOs and models |
| ⚠️ Error Handling | Structured JSON error responses via @ControllerAdvice |

---

## 🔌 REST API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login/demo?role=student` | Demo login (no password) |
| `POST` | `/api/auth/signup` | Register new student account |
| `GET`  | `/api/auth/profile/{id}` | Get profile by ID |

### Books
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/books` | List all books |
| `GET`  | `/api/books?q=java` | Search books |
| `GET`  | `/api/books/{id}` | Get book by ID |
| `POST` | `/api/books` | Create a book (admin) |
| `DELETE` | `/api/books/{id}` | Delete a book (admin) |

### Actions (Form-based)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/action/borrow` | Borrow a book |
| `POST` | `/api/action/return` | Return a book |

---

## 🗄️ H2 Console (Development Only)

Access the in-memory database browser at:

```
http://localhost:8080/h2-console
```

| Field | Value |
|-------|-------|
| JDBC URL | `jdbc:h2:mem:academicosdb` |
| Username | `sa` |
| Password | `password` |

---

## 🎭 Demo Accounts

The app seeds 3 demo profiles on startup:

| Role | Email | Login URL |
|------|-------|-----------|
| 🎓 Student | student@demo.academic.com | `/dashboard?userId=demo-student-id` |
| 👨‍🏫 Teacher | teacher@demo.academic.com | `/dashboard?userId=demo-teacher-id` |
| ⚙️ Admin | admin@demo.academic.com | `/dashboard?userId=demo-admin-id` |

---

## 🏭 Production Deployment

1. Copy the example config:
   ```bash
   cp src/main/resources/application-prod.properties.example src/main/resources/application-prod.properties
   ```
2. Fill in your PostgreSQL credentials in `application-prod.properties`
3. Run with the `prod` profile:
   ```bash
   java -jar target/*.jar --spring.profiles.active=prod
   ```

> ⚠️ **Never commit `application-prod.properties`** — it contains database secrets. It is listed in `.gitignore`.

---

## 🧪 Running Tests

```bash
mvnw.cmd test
```

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.
