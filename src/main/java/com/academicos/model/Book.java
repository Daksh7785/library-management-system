package com.academicos.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "books")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Book {
    @Id
    private String id;
    private String title;
    private String author;
    private String isbn;
    private String description;
    private String coverUrl;
    private String category;
    private Double rating;
    private Integer reviewsCount;
    private Integer publishedYear;
    private Integer totalPages;
    private String language;
    private Boolean available;
}
