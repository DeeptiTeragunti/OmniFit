package com.fitness.aiservice.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

/**
 * See gateway's InternalAuthHeaderFilter - this rejects any request that didn't come
 * through the gateway (and therefore never had its caller's JWT verified). Only guards the
 * HTTP-facing RecommendationController; the RabbitMQ listener is a separate trust boundary
 * (anything that can publish to activity.queue directly already has broker credentials).
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class InternalAuthFilter implements WebFilter {

    @Value("${internal.api.secret}")
    private String expectedSecret;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        if (!expectedSecret.equals(exchange.getRequest().getHeaders().getFirst("X-Internal-Auth"))) {
            exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
            return exchange.getResponse().setComplete();
        }
        return chain.filter(exchange);
    }
}
