package com.agathaba.mailgateway.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import java.util.Map;

public record MailSendRequest(
    String from,
    @NotEmpty List<@NotBlank String> to,
    List<@NotBlank String> cc,
    List<@NotBlank String> bcc,
    @NotBlank String subject,
    String text,
    String html,
    String replyTo,
    Map<String, String> headers
) {
}
