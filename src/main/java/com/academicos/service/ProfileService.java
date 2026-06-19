package com.academicos.service;

import com.academicos.dto.AuthResponse;
import com.academicos.dto.SignupRequest;
import com.academicos.exception.DuplicateResourceException;
import com.academicos.exception.ResourceNotFoundException;
import com.academicos.model.Profile;
import com.academicos.repository.ProfileRepository;
import com.academicos.security.JwtTokenUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Service layer for Profile / Authentication operations.
 */
@Service
@Transactional(readOnly = true)
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final JwtTokenUtil jwtTokenUtil;

    public ProfileService(ProfileRepository profileRepository, JwtTokenUtil jwtTokenUtil) {
        this.profileRepository = profileRepository;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    public Profile findById(String id) {
        return profileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Profile", "id", id));
    }

    public Profile findByEmail(String email) {
        return profileRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Profile", "email", email));
    }

    /**
     * Demo login — finds or creates a demo profile for the given role.
     */
    @Transactional
    public AuthResponse demoLogin(String role) {
        String email = role + "@demo.academic.com";
        Profile profile = profileRepository.findByEmail(email).orElseGet(() -> {
            int limit = role.equals("admin") ? 99 : role.equals("teacher") ? 10 : 5;
            Profile p = Profile.builder()
                    .id("demo-" + role + "-id")
                    .email(email)
                    .fullName("Demo " + capitalize(role))
                    .role(role)
                    .xp(100)
                    .streakDays(1)
                    .maxLimit(limit)
                    .build();
            return profileRepository.save(p);
        });
        return buildAuthResponse(profile);
    }

    /**
     * Sign up a new user.
     */
    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (profileRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new DuplicateResourceException("Email '" + request.getEmail() + "' is already registered.");
        }
        Profile profile = Profile.builder()
                .id("user-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8))
                .email(request.getEmail())
                .fullName(request.getName())
                .role("student")
                .xp(0)
                .streakDays(0)
                .maxLimit(3)
                .build();
        profileRepository.save(profile);
        return buildAuthResponse(profile);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private AuthResponse buildAuthResponse(Profile profile) {
        String token = jwtTokenUtil.generateToken(profile);

        return AuthResponse.builder()
                .session(AuthResponse.SessionInfo.builder()
                        .accessToken(token)
                        .user(AuthResponse.UserInfo.builder()
                                .id(profile.getId())
                                .email(profile.getEmail())
                                .name(profile.getFullName())
                                .build())
                        .build())
                .profile(AuthResponse.ProfileInfo.builder()
                        .id(profile.getId())
                        .email(profile.getEmail())
                        .fullName(profile.getFullName())
                        .role(profile.getRole())
                        .avatarUrl(profile.getAvatarUrl())
                        .xp(profile.getXp())
                        .streakDays(profile.getStreakDays())
                        .maxLimit(profile.getMaxLimit())
                        .build())
                .build();
    }

    private String capitalize(String s) {
        if (s == null || s.isEmpty()) return s;
        return s.substring(0, 1).toUpperCase() + s.substring(1);
    }
}
