package com.agathaba.mailgateway.api;

import com.agathaba.mailgateway.api.dto.MailSendRequest;
import com.agathaba.mailgateway.api.dto.MailSendResponse;
import com.agathaba.mailgateway.config.MailGatewayProperties;
import com.agathaba.mailgateway.service.MailDispatchService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/v1/mail")
public class MailController {

  private final MailDispatchService mailDispatchService;
  private final MailGatewayProperties properties;

  public MailController(MailDispatchService mailDispatchService, MailGatewayProperties properties) {
    this.mailDispatchService = mailDispatchService;
    this.properties = properties;
  }

  @PostMapping("/send")
  public MailSendResponse send(
      @RequestHeader(name = "X-Api-Key", required = false) String apiKey,
      @Valid @RequestBody MailSendRequest request
  ) {
    if (apiKey == null || !apiKey.equals(properties.apiKey())) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid API key");
    }

    String messageId = mailDispatchService.dispatch(request);
    return new MailSendResponse(true, messageId);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String, Object>> handleValidationError(MethodArgumentNotValidException error) {
    return ResponseEntity.badRequest().body(Map.of(
        "error", "Invalid payload",
        "details", error.getBindingResult().toString()));
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException error) {
    return ResponseEntity.badRequest().body(Map.of("error", error.getMessage()));
  }

  @ExceptionHandler(IllegalStateException.class)
  public ResponseEntity<Map<String, Object>> handleIllegalState(IllegalStateException error) {
    return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(Map.of("error", error.getMessage()));
  }
}
