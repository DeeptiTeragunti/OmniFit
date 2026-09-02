package com.fitness.userservice.service;

import com.fitness.userservice.dto.RegisterRequest;
import com.fitness.userservice.dto.UserResponse;
import com.fitness.userservice.exception.UserNotFoundException;
import com.fitness.userservice.model.User;
import com.fitness.userservice.model.UserRole;
import com.fitness.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository repository;

    /**
     * Idempotent by keycloakId: the gateway only calls this after validateUser() already
     * returned false, but two concurrent first-requests from the same brand-new user could
     * still race here, so returning the existing row instead of duplicating is the safe move.
     */
    public UserResponse register(RegisterRequest request) {
        return repository.findByKeycloakId(request.getKeycloakId())
                .map(this::toResponse)
                .orElseGet(() -> toResponse(createOrRelink(request)));
    }

    /**
     * The email already existing under a *different* keycloakId means the identity
     * provider re-issued this person a new subject (e.g. a non-persistent Keycloak dev
     * instance got reset) while this row survived. Re-link rather than fail outright -
     * the alternative is a 500 on every future login for that user.
     */
    private User createOrRelink(RegisterRequest request) {
        try {
            User newUser = new User();
            newUser.setKeycloakId(request.getKeycloakId());
            newUser.setEmail(request.getEmail());
            newUser.setFirstName(request.getFirstName());
            newUser.setLastName(request.getLastName());
            newUser.setRole("ADMIN".equals(request.getRole()) ? UserRole.ADMIN : UserRole.USER);
            log.info("Registering new user for keycloakId {} with role {}", request.getKeycloakId(), newUser.getRole());
            return repository.save(newUser);
        } catch (DataIntegrityViolationException e) {
            log.warn("Email {} already registered under a different keycloakId - relinking to {}",
                    request.getEmail(), request.getKeycloakId());
            User existing = repository.findByEmail(request.getEmail()).orElseThrow(() -> e);
            existing.setKeycloakId(request.getKeycloakId());
            return repository.save(existing);
        }
    }

    public UserResponse getUserProfile(String keycloakId) {
        User user = repository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new UserNotFoundException(keycloakId));
        return toResponse(user);
    }

    public boolean existsByUserId(String keycloakId) {
        return repository.existsByKeycloakId(keycloakId);
    }

    private UserResponse toResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setKeycloakId(user.getKeycloakId());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setRole(user.getRole().name());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        return response;
    }
}
