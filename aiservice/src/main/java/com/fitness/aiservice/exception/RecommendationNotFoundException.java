package com.fitness.aiservice.exception;

public class RecommendationNotFoundException extends RuntimeException {
    public RecommendationNotFoundException(String activityId) {
        super("No recommendation found for activity: " + activityId);
    }
}
