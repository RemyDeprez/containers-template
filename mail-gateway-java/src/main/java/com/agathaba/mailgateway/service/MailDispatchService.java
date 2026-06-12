package com.agathaba.mailgateway.service;

import com.agathaba.mailgateway.api.dto.MailSendRequest;
import com.agathaba.mailgateway.config.MailGatewayProperties;
import org.springframework.stereotype.Service;

@Service
public class MailDispatchService {

  private final MailProvider mailProvider;
  private final MailGatewayProperties properties;

  public MailDispatchService(MailProvider mailProvider, MailGatewayProperties properties) {
    this.mailProvider = mailProvider;
    this.properties = properties;
  }

  public String dispatch(MailSendRequest request) {
    if ((request.text() == null || request.text().isBlank()) && (request.html() == null || request.html().isBlank())) {
      throw new IllegalArgumentException("Either text or html is required");
    }

    String from = request.from();
    if (from == null || from.isBlank()) {
      from = properties.defaultFrom();
    }

    MailSendRequest normalized = new MailSendRequest(
        from,
        request.to(),
        request.cc(),
        request.bcc(),
        request.subject(),
        request.text(),
        request.html(),
        request.replyTo(),
        request.headers());

    return mailProvider.send(normalized);
  }
}
