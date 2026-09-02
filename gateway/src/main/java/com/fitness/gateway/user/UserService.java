package com.fitness.gateway.user;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class UserService {

    private final WebClient.Builder webClientBuilder;

    public Mono<Boolean> validateUser(String userId) {
        return webClientBuilder.build()
                .get()
                .uri("lb://user-service/api/users/{userId}/validate", userId)
                .retrieve()
                .bodyToMono(Boolean.class)
                .onErrorResume(WebClientResponseException.NotFound.class, ex -> Mono.just(false));
    }

    public Mono<UserResponse> registerUser(RegisterRequest request) {
        return webClientBuilder.build()
                .post()
                .uri("lb://user-service/api/users/register")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(UserResponse.class);
    }
}
