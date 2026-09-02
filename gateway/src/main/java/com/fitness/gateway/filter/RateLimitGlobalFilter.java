package com.fitness.gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.net.InetSocketAddress;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Runs first among the gateway's GlobalFilters, ahead of user-sync - a request over the
 * limit should be rejected as cheaply as possible, before any downstream work happens.
 *
 * ponytail: fixed-window counter in an unbounded ConcurrentHashMap, single gateway instance
 * only. Fine for one dev/demo instance; if this ever needs to survive a restart, run behind
 * multiple gateway replicas, or tighten the window-boundary burst allowance, swap for
 * Spring Cloud Gateway's Redis-backed RequestRateLimiter instead of growing this by hand.
 */
@Component
public class RateLimitGlobalFilter implements GlobalFilter, Ordered {

    private static final int LIMIT_PER_WINDOW = 100;
    private static final long WINDOW_SECONDS = 60;

    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();

    private record Window(long windowStart, AtomicInteger count) {
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        return ReactiveSecurityContextHolder.getContext()
                .map(SecurityContext::getAuthentication)
                .filter(JwtAuthenticationToken.class::isInstance)
                .map(auth -> ((JwtAuthenticationToken) auth).getToken().getSubject())
                .defaultIfEmpty(clientIp(exchange))
                .flatMap(key -> {
                    if (overLimit(key)) {
                        exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
                        return exchange.getResponse().setComplete();
                    }
                    return chain.filter(exchange);
                });
    }

    private boolean overLimit(String key) {
        long currentWindow = Instant.now().getEpochSecond() / WINDOW_SECONDS;
        Window window = windows.compute(key, (k, existing) -> {
            if (existing == null || existing.windowStart() != currentWindow) {
                return new Window(currentWindow, new AtomicInteger(1));
            }
            existing.count().incrementAndGet();
            return existing;
        });
        return window.count().get() > LIMIT_PER_WINDOW;
    }

    private String clientIp(ServerWebExchange exchange) {
        InetSocketAddress remote = exchange.getRequest().getRemoteAddress();
        return remote != null ? remote.getAddress().getHostAddress() : "unknown";
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }
}
