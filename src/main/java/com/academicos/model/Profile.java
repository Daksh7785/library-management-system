package com.academicos.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "profiles")
public class Profile {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private String id;

    @Email(message = "Must be a valid email address")
    @NotBlank(message = "Email is required")
    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @NotBlank(message = "Full name is required")
    @Size(max = 255)
    @Column(name = "full_name", nullable = false)
    private String fullName;

    /**
     * Role values: student | teacher | admin
     */
    @NotBlank
    @Pattern(regexp = "student|teacher|admin",
             message = "Role must be 'student', 'teacher', or 'admin'")
    @Column(name = "role", nullable = false, length = 20)
    private String role;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Min(0)
    @Column(name = "xp")
    private Integer xp = 0;

    @Min(0)
    @Column(name = "streak_days")
    private Integer streakDays = 0;

    @Min(1)
    @Column(name = "max_limit")
    private Integer maxLimit = 3;

    // ── Constructors ────────────────────────────────────────────────────────
    public Profile() {}

    public Profile(String id, String email, String fullName, String role, String avatarUrl,
                   Integer xp, Integer streakDays, Integer maxLimit) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.avatarUrl = avatarUrl;
        this.xp = xp;
        this.streakDays = streakDays;
        this.maxLimit = maxLimit;
    }

    // ── Builder ─────────────────────────────────────────────────────────────
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String id, email, fullName, role, avatarUrl;
        private Integer xp = 0, streakDays = 0, maxLimit = 3;

        public Builder id(String id) { this.id = id; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder fullName(String fullName) { this.fullName = fullName; return this; }
        public Builder role(String role) { this.role = role; return this; }
        public Builder avatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; return this; }
        public Builder xp(Integer xp) { this.xp = xp; return this; }
        public Builder streakDays(Integer streakDays) { this.streakDays = streakDays; return this; }
        public Builder maxLimit(Integer maxLimit) { this.maxLimit = maxLimit; return this; }
        public Profile build() {
            return new Profile(id, email, fullName, role, avatarUrl, xp, streakDays, maxLimit);
        }
    }

    // ── Getters & Setters ───────────────────────────────────────────────────
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
