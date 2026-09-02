package com.fitness.userservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "keycloakId is required")
    private String keycloakId;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String firstName;
    private String lastName;

    /** "ADMIN" or "USER", as read from the caller's Keycloak roles at the gateway. */
    private String role;
}
