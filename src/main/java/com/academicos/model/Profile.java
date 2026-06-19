package com.academicos.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Profile {
    @Id
    private String id;
    private String email;
    private String fullName;
    private String role;
    private String avatarUrl;
    private Integer xp;
    private Integer streakDays;
    private Integer maxLimit;
}
