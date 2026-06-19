# Version Summary: 1.0.0-SNAPSHOT

This document provides a high-level summary of the release metadata, target platforms, and environment constraints for this version.

---

## 📌 Release Metadata

* **Target Version**: `1.0.0-SNAPSHOT`
* **Release Name**: `Java Spring Boot Clean Architecture Migration`
* **Release Date**: `2026-06-19`
* **Git Commit Count**: `9 new commits`
* **Git Branch**: `main`

---

## 💻 Tech Matrix & Requirements

| Specification | Target Level | Description |
|---|---|---|
| **JDK (Java Runtime)** | Java 21 / 25 | Compiles and runs under Java 21 LTS and is tested compatible with JDK 25 EA. |
| **Spring Boot** | 3.3.5 | Relies on Spring Boot MVC, JPA, Security, and Thymeleaf starters. |
| **Validation API** | Jakarta Validation 3.x | Backed by Hibernate Validator. |
| **JSON Web Token** | jjwt 0.11.5 | Handles stateless session authentication tokens. |
| **Maven Version** | Apache Maven 3.9+ | Managed seamlessly via included Maven Wrapper. |
| **Supported Databases** | H2 & PostgreSQL | Local H2 database (in-memory) or production PostgreSQL database. |

---

## 🛠️ Verification & Compilation Status

* **Clean Compile**: Pass (Verified using `./mvnw clean compile` on JDK 25)
* **Test Suite**: Pass (Verified with `./mvnw test`)
* **War/Jar Output**: `library-management-system-1.0.0-SNAPSHOT.jar`
