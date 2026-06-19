package com.academicos.controller;

import com.academicos.dto.AuthResponse;
import com.academicos.dto.SignupRequest;
import com.academicos.model.Profile;
import com.academicos.service.ProfileService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@Validated
public class AuthController {

    private final ProfileService profileService;

    public AuthController(ProfileService profileService) {
        this.profileService = profileService;
    }

    /**
     * POST /api/auth/login/demo?role=student|teacher|admin
     * Demo login — no password required. Creates a profile if it doesn't exist.
     */
    @PostMapping("/login/demo")
    public ResponseEntity<AuthResponse> demoLogin(
            @RequestParam
            @NotBlank
            @Pattern(regexp = "student|teacher|admin", message = "Role must be student, teacher, or admin")
            String role) {
        return ResponseEntity.ok(profileService.demoLogin(role));
    }

    /**
     * POST /api/auth/signup
     * Register a new student account.
     */
    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        return ResponseEntity.ok(profileService.signup(request));
    }

    /**
     * GET /api/auth/profile/{id}
     * Fetch a profile by its ID.
     */
    @GetMapping("/profile/{id}")
    public ResponseEntity<Profile> getProfile(@PathVariable String id) {
        return ResponseEntity.ok(profileService.findById(id));
    }
}
