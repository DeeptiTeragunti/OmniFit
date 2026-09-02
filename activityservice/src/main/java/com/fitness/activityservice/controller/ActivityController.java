package com.fitness.activityservice.controller;

import com.fitness.activityservice.dto.ActivityRequest;
import com.fitness.activityservice.dto.ActivityResponse;
import com.fitness.activityservice.service.ActivityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.List;

/**
 * Reachable only through the gateway, same trust model as userservice: X-User-ID / X-User-Roles
 * are gateway-verified and trusted here without re-checking a token.
 */
@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    @PostMapping
    public Mono<ResponseEntity<ActivityResponse>> trackActivity(
            @Valid @RequestBody ActivityRequest request,
            @RequestHeader("X-User-ID") String userId) {
        return activityService.trackActivity(request, userId).map(ResponseEntity::ok);
    }

    @GetMapping
    public Flux<ActivityResponse> getUserActivities(@RequestHeader("X-User-ID") String userId) {
        return activityService.getUserActivities(userId);
    }

    @GetMapping("/{activityId}")
    public Mono<ResponseEntity<ActivityResponse>> getActivity(
            @PathVariable String activityId,
            @RequestHeader("X-User-ID") String callerUserId,
            @RequestHeader(value = "X-User-Roles", defaultValue = "") String callerRoles) {
        List<String> roles = Arrays.asList(callerRoles.split(","));
        return activityService.getActivityById(activityId, callerUserId, roles).map(ResponseEntity::ok);
    }
}
