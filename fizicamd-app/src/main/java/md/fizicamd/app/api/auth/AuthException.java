package md.fizicamd.app.api.auth;

import org.springframework.http.HttpStatus;

public class AuthException extends RuntimeException {
  private final HttpStatus status;

  public AuthException(HttpStatus status, String message) {
    super(message);
    this.status = status;
  }

  public HttpStatus getStatus() {
    return status;
  }

  public static AuthException invalidCredentials() {
    return new AuthException(HttpStatus.UNAUTHORIZED, "Authentication failed");
  }

  public static AuthException inactiveUser() {
    return new AuthException(HttpStatus.FORBIDDEN, "Authentication failed");
  }
}
