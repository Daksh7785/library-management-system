package com.academicos.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {
    @Id
    private String id;
    private String userId;
    private String copyId;
    private String bookId;
    private String issueDate;
    private String dueDate;
    private String returnDate;
    private String status; // issued, returned, overdue
    private Double fine;
}
