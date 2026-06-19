package com.academicos.controller;

import com.academicos.model.Profile;
import com.academicos.repository.ProfileRepository;
import com.academicos.security.JwtTokenUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login/demo")
    public Map<String, Object> demoLogin(@RequestParam String role) {
        String email = role + "@demo.academic.com";
        Profile profile = profileRepository.findByEmail(email).orElse(null);
        
        if (profile == null) {
            profile = new Profile();
            profile.setId("demo-" + role + "-id");
            profile.setEmail(email);
            profile.setFullName("Demo " + role.substring(0, 1).toUpperCase() + role.substring(1));
            profile.setRole(role);
            profile.setXp(100);
            profile.setStreakDays(1);
            profile.setMaxLimit(5);
            profileRepository.save(profile);
        }

        // Generate actual JWT Token
        String token = jwtTokenUtil.generateToken(profile);

        Map<String, Object> response = new HashMap<>();
        response.put("session", Map.of(
            "access_token", token,
            "user", Map.of(
                "id", profile.getId(),
                "email", profile.getEmail(),
                "user_metadata", Map.of("name", profile.getFullName())
            )
        ));
        response.put("profile", profile);
        return response;
    }

    @PostMapping("/signup")
    public Map<String, Object> signup(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");
        String name = request.get("name");

        if (profileRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already registered!");
        }

        Profile profile = new Profile();
        profile.setId("user-" + java.util.UUID.randomUUID().toString().substring(0, 8));
        profile.setEmail(email);
        profile.setFullName(name);
        profile.setRole("student");
        profile.setXp(0);
        profile.setStreakDays(1);
        profile.setMaxLimit(3);
        profileRepository.save(profile);

        String token = jwtTokenUtil.generateToken(profile);

        return Map.of(
            "session", Map.of(
                "access_token", token,
                "user", Map.of(
                    "id", profile.getId(),
                    "email", profile.getEmail(),
                    "user_metadata", Map.of("name", profile.getFullName())
                )
            ),
            "profile", profile
        );
    }

    @GetMapping("/profile/{id}")
    public Profile getProfile(@PathVariable String id) {
        return profileRepository.findById(id).orElse(null);
    }
}
