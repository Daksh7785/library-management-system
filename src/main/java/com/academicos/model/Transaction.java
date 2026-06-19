package com.academicos.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private String id;

    @NotBlank(message = "User ID is required")
    @Column(name = "user_id", nullable = false)
    private String userId;

    @NotBlank(message = "Copy ID is required")
    @Column(name = "copy_id", nullable = false)
    private String copyId;

    @NotBlank(message = "Book ID is required")
    @Column(name = "book_id", nullable = false)
    private String bookId;

    @Column(name = "issue_date")
    private LocalDate issueDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "return_date")
    private LocalDate returnDate;

    /**
     * Status values: issued | returned | overdue
     */
    @NotBlank
    @Pattern(regexp = "issued|returned|overdue",
             message = "Status must be 'issued', 'returned', or 'overdue'")
    @Column(name = "status", nullable = false, length = 20)
    private String status = "issued";

    @DecimalMin("0.0")
    @Column(name = "fine")
    private Double fine = 0.0;

    // ── Constructors ────────────────────────────────────────────────────────
    public Transaction() {}

    public Transaction(String id, String userId, String copyId, String bookId,
                       LocalDate issueDate, LocalDate dueDate, LocalDate returnDate,
                       String status, Double fine) {
        this.id = id;
        this.userId = userId;
        this.copyId = copyId;
        this.bookId = bookId;
        this.issueDate = issueDate;
        this.dueDate = dueDate;
        this.returnDate = returnDate;
        this.status = status;
        this.fine = fine;
    }

    // ── Builder ─────────────────────────────────────────────────────────────
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String id, userId, copyId, bookId, status = "issued";
        private LocalDate issueDate, dueDate, returnDate;
        private Double fine = 0.0;

        public Builder id(String id) { this.id = id; return this; }
        public Builder userId(String userId) { this.userId = userId; return this; }
        public Builder copyId(String copyId) { this.copyId = copyId; return this; }
        public Builder bookId(String bookId) { this.bookId = bookId; return this; }
        public Builder issueDate(LocalDate issueDate) { this.issueDate = issueDate; return this; }
        public Builder dueDate(LocalDate dueDate) { this.dueDate = dueDate; return this; }
        public Builder returnDate(LocalDate returnDate) { this.returnDate = returnDate; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder fine(Double fine) { this.fine = fine; return this; }
        public Transaction build() {
            return new Transaction(id, userId, copyId, bookId, issueDate, dueDate, returnDate, status, fine);
        }
    }

    // ── Getters & Setters ───────────────────────────────────────────────────
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getCopyId() { return copyId; }
    public void setCopyId(String copyId) { this.copyId = copyId; }
    public String getBookId() { return bookId; }
    public void setBookId(String bookId) { this.bookId = bookId; }
    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public LocalDate getReturnDate() { return returnDate; }
    public void setReturnDate(LocalDate returnDate) { this.returnDate = returnDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Double getFine() { return fine; }
    public void setFine(Double fine) { this.fine = fine; }
}
