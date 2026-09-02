package com.fitness.gateway.filter;

import com.fitness.gateway.user.RegisterRequest;
import com.fitness.gateway.user.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

/**
 * Runs as a Spring Cloud Gateway GlobalFilter, which - unlike a plain WebFilter - executes
 * after Spring Security has already authenticated the request. That means the JWT here has
 * already had its signature and expiry verified by the resource server filter; this class
 * only ever reads claims off that already-trusted {@link Jwt}, it never re-parses the raw
 * token itself. Any user not seen before gets registered in userservice on their first
 * authenticated request, and every downstream call gets an X-User-ID header so services
 * never have to touch a token themselves.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class UserSyncGlobalFilter implements GlobalFilter, Ordered {

    private final UserService userService;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        return ReactiveSecurityContextHolder.getContext()
                .map(SecurityContext::getAuthentication)
                .filter(JwtAuthenticationToken.class::isInstance)
                .map(auth -> ((JwtAuthenticationToken) auth).getToken())
                .flatMap(jwt -> syncAndForward(exchange, chain, jwt))
                .switchIfEmpty(chain.filter(exchange));
    }

    private Mono<Void> syncAndForward(ServerWebExchange exchange, GatewayFilterChain chain, Jwt jwt) {
        String keycloakId = jwt.getSubject();
        List<String> roles = rolesOf(jwt);
        RegisterRequest registerRequest = RegisterRequest.builder()
                .keycloakId(keycloakId)
                .email(jwt.getClaimAsString("email"))
                .firstName(jwt.getClaimAsString("given_name"))
                .lastName(jwt.getClaimAsString("family_name"))
                .role(roles.contains("ADMIN") ? "ADMIN" : "USER")
                .build();

        return userService.validateUser(keycloakId)
                .flatMap(exists -> exists ? Mono.empty() : userService.registerUser(registerRequest))
                .onErrorResume(ex -> {
                    log.warn("User sync failed for {}: {}", keycloakId, ex.getMessage());
                    return Mono.empty();
                })
                .then(Mono.defer(() -> {
                    ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                            .header("X-User-ID", keycloakId)
                            .header("X-User-Roles", String.join(",", rolesOf(jwt)))
                            .build();
                    return chain.filter(exchange.mutate().request(mutatedRequest).build());
                }));
    }

    /**
     * Same realm_access.roles claim SecurityConfig maps into Spring authorities, read again
     * here (raw, no ROLE_ prefix) so downstream services can do their own role checks without
     * having to see or trust the JWT themselves.
     */
    @SuppressWarnings("unchecked")
    private List<String> rolesOf(Jwt jwt) {
        Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
        if (realmAccess == null || !(realmAccess.get("roles") instanceof List<?> roles)) {
            return List.of();
        }
        return (List<String>) roles;
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 10;
    }
}
