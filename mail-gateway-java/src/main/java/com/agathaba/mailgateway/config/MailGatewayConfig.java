package com.agathaba.mailgateway.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(MailGatewayProperties.class)
public class MailGatewayConfig {
}
