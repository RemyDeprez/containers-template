package com.agathaba.mailgateway.api.dto;

public record MailSendResponse(boolean accepted, String messageId) {
}
