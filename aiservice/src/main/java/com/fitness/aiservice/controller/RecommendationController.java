package com.fitness.aiservice.controller;

import com.fitness.aiservice.model.Recommendation;
import com.fitness.aiservice.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/recommendations")
public class RecommendationController {
    private final RecommendationService recommendationService;

    @GetMapping("/user/{userId}")
    public Flux<Recommendation> getUserRecommendations(
            @PathVariable String userId,
            @RequestHeader("X-User-ID") String callerUserId,
            @RequestHeader(value = "X-User-Roles", defaultValue = "") String callerRoles) {
        return recommendationService.getUserRecommendations(userId, callerUserId, rolesOf(callerRoles));
    }

    @GetMapping("/activity/{activityId}")
    public Mono<ResponseEntity<Recommendation>> getActivityRecommendation(
            @PathVariable String activityId,
            @RequestHeader("X-User-ID") String callerUserId,
            @RequestHeader(value = "X-User-Roles", defaultValue = "") String callerRoles) {
        return recommendationService.getActivityRecommendation(activityId, callerUserId, rolesOf(callerRoles))
                .map(ResponseEntity::ok);
    }

    private List<String> rolesOf(String header) {
        return Arrays.asList(header.split(","));
    }
}
