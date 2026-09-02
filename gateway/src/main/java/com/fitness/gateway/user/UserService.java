package com.fitness.gateway.user;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

/**
 * These are the gateway's OWN outbound calls, not the request being proxied - the
 * InternalAuthHeaderFilter only stamps X-Internal-Auth on the proxied request, so these
 * calls need to carry it themselves or userservice's InternalAuthFilter rejects them too.
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final WebClient.Builder webClientBuilder;

    @Value("${internal.api.secret}")
    private String internalSecret;

    public Mono<Boolean> validateUser(String userId) {
        return webClientBuilder.build()
                .get()
                .uri("lb://user-service/api/users/{userId}/validate", userId)
                .header("X-Internal-Auth", internalSecret)
                .retrieve()
                .bodyToMono(Boolean.class)
                .onErrorResume(WebClientResponseException.NotFound.class, ex -> Mono.just(false));
    }

    public Mono<UserResponse> registerUser(RegisterRequest request) {
        return webClientBuilder.build()
                .post()
                .uri("lb://user-service/api/users/register")
                .header("X-Internal-Auth", internalSecret)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(UserResponse.class);
    }
}
