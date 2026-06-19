package com.academicos.dto;

/**
 * API response payload for authentication endpoints.
 * Wraps session info + profile data.
 */
public class AuthResponse {

    private SessionInfo session;
    private ProfileInfo profile;

    public AuthResponse() {}
    public AuthResponse(SessionInfo session, ProfileInfo profile) {
        this.session = session;
        this.profile = profile;
    }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private SessionInfo session;
        private ProfileInfo profile;
        public Builder session(SessionInfo session) { this.session = session; return this; }
        public Builder profile(ProfileInfo profile) { this.profile = profile; return this; }
        public AuthResponse build() { return new AuthResponse(session, profile); }
    }

    public SessionInfo getSession() { return session; }
    public void setSession(SessionInfo session) { this.session = session; }
    public ProfileInfo getProfile() { return profile; }
    public void setProfile(ProfileInfo profile) { this.profile = profile; }

    // ── SessionInfo ──────────────────────────────────────────────────────────
    public static class SessionInfo {
        private String accessToken;
        private UserInfo user;

        public SessionInfo() {}
        public SessionInfo(String accessToken, UserInfo user) {
            this.accessToken = accessToken;
            this.user = user;
        }
        public static Builder builder() { return new Builder(); }
        public static class Builder {
            private String accessToken;
            private UserInfo user;
            public Builder accessToken(String accessToken) { this.accessToken = accessToken; return this; }
            public Builder user(UserInfo user) { this.user = user; return this; }
            public SessionInfo build() { return new SessionInfo(accessToken, user); }
        }
        public String getAccessToken() { return accessToken; }
        public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
        public UserInfo getUser() { return user; }
        public void setUser(UserInfo user) { this.user = user; }
    }

    // ── UserInfo ─────────────────────────────────────────────────────────────
    public static class UserInfo {
        private String id, email, name;

        public UserInfo() {}
        public UserInfo(String id, String email, String name) {
            this.id = id; this.email = email; this.name = name;
        }
        public static Builder builder() { return new Builder(); }
        public static class Builder {
            private String id, email, name;
            public Builder id(String id) { this.id = id; return this; }
            public Builder email(String email) { this.email = email; return this; }
            public Builder name(String name) { this.name = name; return this; }
            public UserInfo build() { return new UserInfo(id, email, name); }
        }
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }

    // ── ProfileInfo ──────────────────────────────────────────────────────────
    public static class ProfileInfo {
        private String id, email, fullName, role, avatarUrl;
        private Integer xp, streakDays, maxLimit;

        public ProfileInfo() {}
        public ProfileInfo(String id, String email, String fullName, String role,
                           String avatarUrl, Integer xp, Integer streakDays, Integer maxLimit) {
            this.id = id; this.email = email; this.fullName = fullName; this.role = role;
            this.avatarUrl = avatarUrl; this.xp = xp; this.streakDays = streakDays; this.maxLimit = maxLimit;
        }
        public static Builder builder() { return new Builder(); }
        public static class Builder {
            private String id, email, fullName, role, avatarUrl;
            private Integer xp, streakDays, maxLimit;
            public Builder id(String id) { this.id = id; return this; }
            public Builder email(String email) { this.email = email; return this; }
            public Builder fullName(String fullName) { this.fullName = fullName; return this; }
            public Builder role(String role) { this.role = role; return this; }
            public Builder avatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; return this; }
            public Builder xp(Integer xp) { this.xp = xp; return this; }
            public Builder streakDays(Integer streakDays) { this.streakDays = streakDays; return this; }
            public Builder maxLimit(Integer maxLimit) { this.maxLimit = maxLimit; return this; }
            public ProfileInfo build() {
                return new ProfileInfo(id, email, fullName, role, avatarUrl, xp, streakDays, maxLimit);
            }
        }
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
}
