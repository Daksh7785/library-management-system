package com.academicos.controller;

import com.academicos.model.Profile;
import com.academicos.repository.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private ProfileRepository profileRepository;

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

        Map<String, Object> response = new HashMap<>();
        response.put("session", Map.of(
            "access_token", "java-mock-token-" + role,
            "user", Map.of(
                "id", profile.getId(),
                "email", profile.getEmail(),
                "user_metadata", Map.of("name", profile.getFullName())
            )
        ));
        response.put("profile", profile);
        return response;
    }

    @GetMapping("/profile/{id}")
    public Profile getProfile(@PathVariable String id) {
        return profileRepository.findById(id).orElse(null);
    }
}
