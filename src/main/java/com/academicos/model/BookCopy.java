package com.academicos.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "book_copies")
public class BookCopy {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private String id;

    @NotBlank(message = "Book ID is required")
    @Column(name = "book_id", nullable = false)
    private String bookId;

    @Size(max = 50)
    @Column(name = "qr_code", unique = true)
    private String qrCode;

    @Min(0)
    @Max(100)
    @Column(name = "condition_score")
    private Integer conditionScore;

    /**
     * Status values: available | issued | maintenance
     */
    @NotBlank
    @Pattern(regexp = "available|issued|maintenance",
             message = "Status must be 'available', 'issued', or 'maintenance'")
    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Size(max = 100)
    @Column(name = "location_shelf")
    private String locationShelf;

    // ── Constructors ────────────────────────────────────────────────────────
    public BookCopy() {}

    public BookCopy(String id, String bookId, String qrCode, Integer conditionScore,
                    String status, String locationShelf) {
        this.id = id;
        this.bookId = bookId;
        this.qrCode = qrCode;
        this.conditionScore = conditionScore;
        this.status = status;
        this.locationShelf = locationShelf;
    }

    // ── Builder ─────────────────────────────────────────────────────────────
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String id, bookId, qrCode, status, locationShelf;
        private Integer conditionScore;

        public Builder id(String id) { this.id = id; return this; }
        public Builder bookId(String bookId) { this.bookId = bookId; return this; }
        public Builder qrCode(String qrCode) { this.qrCode = qrCode; return this; }
        public Builder conditionScore(Integer conditionScore) { this.conditionScore = conditionScore; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder locationShelf(String locationShelf) { this.locationShelf = locationShelf; return this; }
        public BookCopy build() {
            return new BookCopy(id, bookId, qrCode, conditionScore, status, locationShelf);
        }
    }

    // ── Getters & Setters ───────────────────────────────────────────────────
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getBookId() { return bookId; }
    public void setBookId(String bookId) { this.bookId = bookId; }
    public String getQrCode() { return qrCode; }
    public void setQrCode(String qrCode) { this.qrCode = qrCode; }
    public Integer getConditionScore() { return conditionScore; }
    public void setConditionScore(Integer conditionScore) { this.conditionScore = conditionScore; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getLocationShelf() { return locationShelf; }
    public void setLocationShelf(String locationShelf) { this.locationShelf = locationShelf; }
}
