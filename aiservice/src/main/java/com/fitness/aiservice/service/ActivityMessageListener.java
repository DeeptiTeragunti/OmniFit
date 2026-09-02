package com.fitness.aiservice.service;

import com.fitness.aiservice.model.Activity;
import com.fitness.aiservice.repository.RecommendationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

/**
 * RabbitMQ listener container threads are a dedicated pool meant for blocking work - unlike a
 * WebFlux Netty event-loop thread, blocking here (via .block() at this one boundary) is the
 * correct, idiomatic choice rather than a violation of "stay reactive".
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class ActivityMessageListener {

    private final ActivityAIService aiService;
    private final RecommendationRepository recommendationRepository;

    @RabbitListener(queues = "activity.queue")
    public void processActivity(Activity activity) {
        log.info("Received activity for processing: {}", activity.getId());
        aiService.generateRecommendation(activity)
                .flatMap(recommendationRepository::save)
                .doOnSuccess(saved -> log.info("Saved recommendation {} for activity {}", saved.getId(), activity.getId()))
                .block();
    }
}
