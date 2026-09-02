package com.fitness.userservice.controller;

import com.fitness.userservice.dto.RegisterRequest;
import com.fitness.userservice.dto.UserResponse;
import com.fitness.userservice.exception.ForbiddenException;
import com.fitness.userservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

/**
 * Reachable only through the gateway (Phase 3), which has already verified the caller's
 * JWT and forwards their identity as X-User-ID / X-User-Roles. Those headers are trusted
 * here for the same reason a servlet trusts its own session: nothing but the gateway can
 * reach this service on the internal network.
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUserProfile(
            @PathVariable String userId,
            @RequestHeader("X-User-ID") String callerUserId,
            @RequestHeader(value = "X-User-Roles", defaultValue = "") String callerRoles) {
        requireSelfOrAdmin(userId, callerUserId, callerRoles);
        return ResponseEntity.ok(userService.getUserProfile(userId));
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(userService.register(request));
    }

    @GetMapping("/{userId}/validate")
    public ResponseEntity<Boolean> validateUser(@PathVariable String userId) {
        return ResponseEntity.ok(userService.existsByUserId(userId));
    }

    private void requireSelfOrAdmin(String userId, String callerUserId, String callerRoles) {
        boolean isSelf = userId.equals(callerUserId);
        List<String> roles = Arrays.asList(callerRoles.split(","));
        if (!isSelf && !roles.contains("ADMIN")) {
            throw new ForbiddenException("Cannot view another user's profile");
        }
    }
}
