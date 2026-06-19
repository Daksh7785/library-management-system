package com.academicos.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "profiles")
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

    // Constructors
    public Profile() {}

    public Profile(String id, String email, String fullName, String role, String avatarUrl, Integer xp, Integer streakDays, Integer maxLimit) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.avatarUrl = avatarUrl;
        this.xp = xp;
        this.streakDays = streakDays;
        this.maxLimit = maxLimit;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public Integer getXp() { return xp; }
    public void setXp(Integer xp) { this.xp = xp; }

    public Integer getStreakDays() { return streakDays; }
    public void setStreakDays(Integer streakDays) { this.streakDays = streakDays; }

    public Integer getMaxLimit() { return maxLimit; }
    public void setMaxLimit(Integer maxLimit) { this.maxLimit = maxLimit; }
}
