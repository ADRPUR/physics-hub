package md.fizicamd.app.api.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import md.fizicamd.app.api.shared.UserRepresentation;

import java.util.UUID;

public class AuthDtos {

  public record RegisterRequest(
          @Email @NotBlank String email,
          @NotBlank String password,
          @Size(max = 120) String firstName,
          @Size(max = 120) String lastName,
          @Size(max = 64) String phone,
          @Size(max = 255) String school,
          @Size(max = 32) String gradeLevel,
          String birthDate
  ) {}

  public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}

  public record TokenResponse(
          String accessToken,
          String refreshToken,
          long expiresAt,
          UserRepresentation.UserDto user
  ) {}

  public record MeResponse(UUID userId, String email) {}
}
