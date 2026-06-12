package com.agathaba.mailgateway.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "mail-gateway")
public record MailGatewayProperties(String apiKey, String defaultFrom) {
}
