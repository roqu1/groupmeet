package com.groupmeet.application.config;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
public class CacheConfig {

    @Bean("passwordResetRateLimitCache")
    public Cache<String, Long> passwordResetRateLimitCache() {
        return CacheBuilder.newBuilder()
                .expireAfterWrite(2, TimeUnit.MINUTES)
                .build();
    }
}