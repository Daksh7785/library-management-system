package com.academicos.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "book_copies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookCopy {
    @Id
    private String id;
    private String bookId;
    private String qrCode;
    private Integer conditionScore;
    private String status; // available, issued, maintenance
    private String locationShelf;
}
