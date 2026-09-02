package com.fitness.userservice.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * userservice is only ever meant to be reached through the gateway (see the gateway's
 * InternalAuthHeaderFilter, which stamps this header on every proxied request), but on a
 * single dev machine every service also binds to localhost, so nothing at the network level
 * stops a direct call. This rejects anything that didn't come through the gateway.
 */
@Component
public class InternalAuthFilter extends OncePerRequestFilter {

    @Value("${internal.api.secret}")
    private String expectedSecret;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        if (!expectedSecret.equals(request.getHeader("X-Internal-Auth"))) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Direct access not permitted\"}");
            return;
        }
        chain.doFilter(request, response);
    }
}
