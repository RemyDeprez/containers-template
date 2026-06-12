package com.agathaba.mailgateway.service;

import com.agathaba.mailgateway.api.dto.MailSendRequest;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.Map;
import java.util.UUID;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

@Component
public class SmtpMailProvider implements MailProvider {

  private final JavaMailSender mailSender;

  public SmtpMailProvider(JavaMailSender mailSender) {
    this.mailSender = mailSender;
  }

  @Override
  public String send(MailSendRequest request) {
    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

      helper.setFrom(request.from());
      helper.setTo(request.to().toArray(String[]::new));

      if (request.cc() != null && !request.cc().isEmpty()) {
        helper.setCc(request.cc().toArray(String[]::new));
      }

      if (request.bcc() != null && !request.bcc().isEmpty()) {
        helper.setBcc(request.bcc().toArray(String[]::new));
      }

      helper.setSubject(request.subject());

      if (request.replyTo() != null && !request.replyTo().isBlank()) {
        helper.setReplyTo(request.replyTo());
      }

      String text = request.text() == null ? "" : request.text();
      String html = request.html();
      if (html != null && !html.isBlank()) {
        helper.setText(text, html);
      } else {
        helper.setText(text, false);
      }

      if (request.headers() != null) {
        for (Map.Entry<String, String> entry : request.headers().entrySet()) {
          if (entry.getKey() != null && entry.getValue() != null) {
            message.setHeader(entry.getKey(), entry.getValue());
          }
        }
      }

      mailSender.send(message);
      String messageId = message.getMessageID();
      return messageId != null ? messageId : UUID.randomUUID().toString();
    } catch (MessagingException | MailException error) {
      throw new IllegalStateException("Unable to send email", error);
    }
  }
}
