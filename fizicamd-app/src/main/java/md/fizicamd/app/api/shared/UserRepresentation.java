package md.fizicamd.app.api.shared;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class UserRepresentation {

  public record ProfileDto(
          String firstName,
          String lastName,
          String birthDate,
          String phone,
          String school,
          String gradeLevel,
          String locale,
          String timezone,
          String bio,
          String avatarUrl
  ) {}

  public record UserDto(
          UUID id,
          String email,
          String status,
          String role,
          List<String> roles,
          Instant lastLoginAt,
          ProfileDto profile
  ) {}
}
