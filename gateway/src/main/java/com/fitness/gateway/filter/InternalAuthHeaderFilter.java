package com.fitness.gateway.filter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * On a single dev machine every service also binds to localhost, so nothing at the network
 * level stops a request from reaching userservice/activityservice/aiservice directly,
 * bypassing the gateway (and therefore JWT verification) entirely. Each of those services
 * checks for this header (see their own InternalAuthFilter) and rejects anything that
 * doesn't carry it - a real production deployment would also isolate them on a private
 * network, but that isn't something a Spring Security filter can enforce from here.
 */
@Component
public class InternalAuthHeaderFilter implements GlobalFilter, Ordered {

    @Value("${internal.api.secret}")
    private String internalSecret;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest mutated = exchange.getRequest().mutate()
                .header("X-Internal-Auth", internalSecret)
                .build();
        return chain.filter(exchange.mutate().request(mutated).build());
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 5;
    }
}
