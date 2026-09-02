package com.fitness.gateway.diagnostics;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

/**
 * Echoes back what the gateway resolved from the caller's own token: handy for verifying
 * JWT validation and role mapping work without needing any backend service running yet.
 */
@RestController
public class WhoAmIController {

    @GetMapping("/api/whoami")
    public Mono<Map<String, Object>> whoAmI(@AuthenticationPrincipal Jwt jwt) {
        Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
        @SuppressWarnings("unchecked")
        List<String> roles = realmAccess == null ? List.of() : (List<String>) realmAccess.getOrDefault("roles", List.of());
        return Mono.just(Map.of(
                "sub", jwt.getSubject(),
                "email", String.valueOf(jwt.getClaimAsString("email")),
                "roles", roles
        ));
    }
}
