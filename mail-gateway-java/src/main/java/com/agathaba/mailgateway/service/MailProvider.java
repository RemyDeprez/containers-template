package com.agathaba.mailgateway.service;

import com.agathaba.mailgateway.api.dto.MailSendRequest;

public interface MailProvider {
  String send(MailSendRequest request);
}
