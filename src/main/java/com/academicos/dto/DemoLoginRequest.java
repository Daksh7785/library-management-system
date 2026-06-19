package com.academicos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * Request body for demo login endpoint.
 */
public class DemoLoginRequest {

    @NotBlank(message = "Role is required")
    @Pattern(regexp = "student|teacher|admin", message = "Role must be student, teacher, or admin")
    private String role;

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
