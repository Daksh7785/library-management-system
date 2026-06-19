package com.academicos.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "book_copies")
public class BookCopy {
    @Id
    private String id;
    private String bookId;
    private String qrCode;
    private Integer conditionScore;
    private String status; // available, issued, maintenance
    private String locationShelf;

    // Constructors
    public BookCopy() {}

    public BookCopy(String id, String bookId, String qrCode, Integer conditionScore, String status, String locationShelf) {
        this.id = id;
        this.bookId = bookId;
        this.qrCode = qrCode;
        this.conditionScore = conditionScore;
        this.status = status;
        this.locationShelf = locationShelf;
    }

    // Getters and Setters
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
