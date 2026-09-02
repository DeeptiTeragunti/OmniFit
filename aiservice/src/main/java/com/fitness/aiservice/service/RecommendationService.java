package com.fitness.aiservice.service;

import com.fitness.aiservice.exception.ForbiddenException;
import com.fitness.aiservice.exception.RecommendationNotFoundException;
import com.fitness.aiservice.model.Recommendation;
import com.fitness.aiservice.repository.RecommendationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecommendationService {
    private final RecommendationRepository recommendationRepository;

    public Flux<Recommendation> getUserRecommendations(String userId, String callerUserId, List<String> callerRoles) {
        if (!isSelfOrAdmin(userId, callerUserId, callerRoles)) {
            return Flux.error(new ForbiddenException("Cannot view another user's recommendations"));
        }
        return recommendationRepository.findByUserId(userId);
    }

    public Mono<Recommendation> getActivityRecommendation(String activityId, String callerUserId, List<String> callerRoles) {
        return recommendationRepository.findByActivityId(activityId)
                .switchIfEmpty(Mono.error(new RecommendationNotFoundException(activityId)))
                .flatMap(recommendation -> {
                    if (!isSelfOrAdmin(recommendation.getUserId(), callerUserId, callerRoles)) {
                        return Mono.error(new ForbiddenException("Cannot view another user's recommendation"));
                    }
                    return Mono.just(recommendation);
                });
    }

    private boolean isSelfOrAdmin(String ownerId, String callerUserId, List<String> callerRoles) {
        return ownerId.equals(callerUserId) || callerRoles.contains("ADMIN");
    }
}
