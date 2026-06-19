# Git Activity & Version Control Report

This report summarizes the version control statistics, branch details, and commit timeline for the migration of the Library Management System.

---

## 📊 Summary Metrics

| Metric | Details |
|--------|---------|
| **Total Commits** | 9 new commits since `origin/main` |
| **Files Modified/Created** | 27 files |
| **Lines Added** | 1,656 lines |
| **Lines Removed** | 398 lines |
| **Contributor** | Daksh7785 <daksh7785@users.noreply.github.com> |
| **Target Branch** | `main` |
| **Push Status** | Pending final push |

---

## 🕒 Commit History Timeline

The following atomic commits have been configured using the Conventional Commit format:

1. **`6199d9f`** — `feat(deployment): update gitignore to clean non-java and legacy assets`
2. **`cd83278`** — `feat(build): upgrade maven configuration, add devtools and validation dependencies`
3. **`414846e`** — `feat(build): integrate maven wrapper binaries for standalone builds`
4. **`a816fd2`** — `feat(core): enhance JPA entity models with validation and manual builders`
5. **`9d0dc68`** — `feat(core): implement service layer and authentication DTOs`
6. **`ca12b53`** — `feat(api): add global exception handler and custom exceptions`
7. **`a594126`** — `refactor(api): restructure controllers to delegate to services and DTOs`
8. **`e8dbf29`** — `feat(deployment): configure dev/prod profiles and refactor application bootstrapper`
9. **`250065f`** — `docs(readme): document project architecture, API endpoints and setup instructions`

---

## 📂 File Modifications Breakdowns

* **Configuration & Workspace**:
  * `.gitignore` — cleaned up node/vite/typescript assets.
  * `pom.xml` — upgraded parent Boot, Java 21, added validation and devtools.
  * `src/main/resources/application.properties` — cleaned.
  * `src/main/resources/application-dev.properties` — H2 configuration.
  * `src/main/resources/application-prod.properties.example` — production template.
* **Entities**:
  * `Book.java`, `BookCopy.java`, `Profile.java`, `Transaction.java` — Jakarta validation & builder pattern.
* **Services**:
  * `BookService.java`, `ProfileService.java`, `TransactionService.java` — business layers.
* **DTOs**:
  * `AuthResponse.java`, `DemoLoginRequest.java`, `SignupRequest.java` — payload encapsulation.
* **Exceptions**:
  * `GlobalExceptionHandler.java`, `ResourceNotFoundException.java`, `DuplicateResourceException.java` — error processing.
* **Controllers**:
  * `ActionController.java`, `AuthController.java`, `BookController.java`, `ViewController.java` — API endpoints.
