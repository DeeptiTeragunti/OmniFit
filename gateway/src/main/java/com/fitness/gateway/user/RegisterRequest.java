package com.fitness.gateway.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * No password field - Keycloak is the only credential store. userservice just needs
 * enough to render a profile for a user Keycloak has already authenticated.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    private String keycloakId;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
}
