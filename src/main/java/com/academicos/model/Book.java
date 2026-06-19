package com.academicos.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "books")
public class Book {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private String id;

    @NotBlank(message = "Title is required")
    @Size(max = 255)
    @Column(name = "title", nullable = false)
    private String title;

    @NotBlank(message = "Author is required")
    @Size(max = 255)
    @Column(name = "author", nullable = false)
    private String author;

    @Size(max = 20)
    @Column(name = "isbn", unique = true)
    private String isbn;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "cover_url")
    private String coverUrl;

    @Size(max = 100)
    @Column(name = "category")
    private String category;

    @DecimalMin("0.0")
    @DecimalMax("5.0")
    @Column(name = "rating")
    private Double rating;

    @Min(0)
    @Column(name = "reviews_count")
    private Integer reviewsCount;

    @Column(name = "published_year")
    private Integer publishedYear;

    @Min(1)
    @Column(name = "total_pages")
    private Integer totalPages;

    @Size(max = 10)
    @Column(name = "language", length = 10)
    private String language;

    @Column(name = "available", nullable = false)
    private Boolean available = true;

    // ── Constructors ────────────────────────────────────────────────────────
    public Book() {}

    public Book(String id, String title, String author, String isbn, String description,
                String coverUrl, String category, Double rating, Integer reviewsCount,
                Integer publishedYear, Integer totalPages, String language, Boolean available) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.isbn = isbn;
        this.description = description;
        this.coverUrl = coverUrl;
        this.category = category;
        this.rating = rating;
        this.reviewsCount = reviewsCount;
        this.publishedYear = publishedYear;
        this.totalPages = totalPages;
        this.language = language;
        this.available = available;
    }

    // ── Builder ─────────────────────────────────────────────────────────────
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String id, title, author, isbn, description, coverUrl, category, language;
        private Double rating;
        private Integer reviewsCount, publishedYear, totalPages;
        private Boolean available = true;

        public Builder id(String id) { this.id = id; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder author(String author) { this.author = author; return this; }
        public Builder isbn(String isbn) { this.isbn = isbn; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder coverUrl(String coverUrl) { this.coverUrl = coverUrl; return this; }
        public Builder category(String category) { this.category = category; return this; }
        public Builder rating(Double rating) { this.rating = rating; return this; }
        public Builder reviewsCount(Integer reviewsCount) { this.reviewsCount = reviewsCount; return this; }
        public Builder publishedYear(Integer publishedYear) { this.publishedYear = publishedYear; return this; }
        public Builder totalPages(Integer totalPages) { this.totalPages = totalPages; return this; }
        public Builder language(String language) { this.language = language; return this; }
        public Builder available(Boolean available) { this.available = available; return this; }
        public Book build() {
            return new Book(id, title, author, isbn, description, coverUrl, category,
                    rating, reviewsCount, publishedYear, totalPages, language, available);
        }
    }

    // ── Getters & Setters ───────────────────────────────────────────────────
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    public String getIsbn() { return isbn; }
    public void setIsbn(String isbn) { this.isbn = isbn; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCoverUrl() { return coverUrl; }
    public void setCoverUrl(String coverUrl) { this.coverUrl = coverUrl; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public Integer getReviewsCount() { return reviewsCount; }
    public void setReviewsCount(Integer reviewsCount) { this.reviewsCount = reviewsCount; }
    public Integer getPublishedYear() { return publishedYear; }
    public void setPublishedYear(Integer publishedYear) { this.publishedYear = publishedYear; }
    public Integer getTotalPages() { return totalPages; }
    public void setTotalPages(Integer totalPages) { this.totalPages = totalPages; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public Boolean getAvailable() { return available; }
    public void setAvailable(Boolean available) { this.available = available; }
}
