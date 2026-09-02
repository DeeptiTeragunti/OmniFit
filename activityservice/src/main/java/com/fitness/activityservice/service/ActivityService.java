package com.fitness.activityservice.service;

import com.fitness.activityservice.dto.ActivityRequest;
import com.fitness.activityservice.dto.ActivityResponse;
import com.fitness.activityservice.exception.ActivityNotFoundException;
import com.fitness.activityservice.exception.ForbiddenException;
import com.fitness.activityservice.exception.InvalidUserException;
import com.fitness.activityservice.model.Activity;
import com.fitness.activityservice.repository.ActivityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final UserValidationService userValidationService;
    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange.name}")
    private String exchange;

    @Value("${rabbitmq.routing.key}")
    private String routingKey;

    public Mono<ActivityResponse> trackActivity(ActivityRequest request, String userId) {
        return userValidationService.validateUser(userId)
                .flatMap(valid -> valid ? saveActivity(request, userId) : Mono.error(new InvalidUserException(userId)))
                .flatMap(saved -> publishEvent(saved).thenReturn(saved))
                .map(this::mapToResponse);
    }

    private Mono<Activity> saveActivity(ActivityRequest request, String userId) {
        Activity activity = Activity.builder()
                .userId(userId)
                .type(request.getType())
                .duration(request.getDuration())
                .caloriesBurned(request.getCaloriesBurned())
                .startTime(request.getStartTime())
                .additionalMetrics(request.getAdditionalMetrics())
                .build();
        return activityRepository.save(activity);
    }

    /**
     * RabbitTemplate is a blocking client - running it on boundedElastic keeps that blocking
     * hop off the small pool of Netty event-loop threads the rest of this service runs on.
     */
    private Mono<Void> publishEvent(Activity activity) {
        return Mono.<Void>fromRunnable(() -> {
                    try {
                        rabbitTemplate.convertAndSend(exchange, routingKey, activity);
                    } catch (Exception e) {
                        log.error("Failed to publish activity {} to RabbitMQ", activity.getId(), e);
                    }
                })
                .subscribeOn(Schedulers.boundedElastic());
    }

    public Flux<ActivityResponse> getUserActivities(String userId) {
        return activityRepository.findByUserId(userId).map(this::mapToResponse);
    }

    public Mono<ActivityResponse> getActivityById(String activityId, String callerUserId, List<String> callerRoles) {
        return activityRepository.findById(activityId)
                .switchIfEmpty(Mono.error(new ActivityNotFoundException(activityId)))
                .flatMap(activity -> {
                    boolean isSelf = activity.getUserId().equals(callerUserId);
                    boolean isAdmin = callerRoles.contains("ADMIN");
                    if (!isSelf && !isAdmin) {
                        return Mono.error(new ForbiddenException("Cannot view another user's activity"));
                    }
                    return Mono.just(mapToResponse(activity));
                });
    }

    private ActivityResponse mapToResponse(Activity activity) {
        ActivityResponse response = new ActivityResponse();
        response.setId(activity.getId());
        response.setUserId(activity.getUserId());
        response.setType(activity.getType());
        response.setDuration(activity.getDuration());
        response.setCaloriesBurned(activity.getCaloriesBurned());
        response.setStartTime(activity.getStartTime());
        response.setAdditionalMetrics(activity.getAdditionalMetrics());
        response.setCreatedAt(activity.getCreatedAt());
        response.setUpdatedAt(activity.getUpdatedAt());
        return response;
    }
}
