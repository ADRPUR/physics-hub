package md.fizicamd.app.api.me;

import jakarta.validation.constraints.Size;
import md.fizicamd.app.api.shared.UserRepresentation;

public class ProfileDtos {

  public record ProfileResponse(UserRepresentation.UserDto user) {}

  public record ProfileUpdateRequest(
          @Size(max = 120) String firstName,
          @Size(max = 120) String lastName,
          String birthDate,
          @Size(max = 16) String gender,
          @Size(max = 64) String phone,
          @Size(max = 255) String school,
          @Size(max = 32) String gradeLevel,
          @Size(max = 1024) String bio
  ) {}
}
