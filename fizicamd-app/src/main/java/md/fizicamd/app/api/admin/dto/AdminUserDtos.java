package md.fizicamd.app.api.admin.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import md.fizicamd.identity.domain.Profile.UserProfile;
import md.fizicamd.identity.domain.User;
import md.fizicamd.identity.domain.UserStatus;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class AdminUserDtos {

  public record AdminUserResponse(
          UUID id,
          String email,
          String status,
          String primaryRole,
          List<String> roles,
          String firstName,
          String lastName,
          String phone,
          String school,
          String gradeLevel,
          Instant createdAt,
          Instant lastLoginAt,
          Instant lastSeenAt
  ) {
    public static AdminUserResponse from(User user, UserProfile profile) {
      var roles = user.getRoles().stream()
              .map(ur -> ur.getRole().getCode().name())
              .toList();
      var primary = roles.isEmpty() ? "STUDENT" : roles.get(0);
      return new AdminUserResponse(
              user.getId(),
              user.getEmail(),
              user.getStatus().name(),
              primary,
              roles,
              profile != null ? profile.getFirstName() : null,
              profile != null ? profile.getLastName() : null,
              profile != null ? profile.getPhone() : null,
              profile != null ? profile.getSchool() : null,
              profile != null ? profile.getGradeLevel() : null,
              user.getCreatedAt(),
              user.getLastLoginAt(),
              user.getLastSeenAt()
      );
    }
  }

  public record AdminUserCreateRequest(
          @Email @NotBlank String email,
          @NotBlank String password,
          @NotEmpty List<String> roles,
          @Size(max = 120) String firstName,
          @Size(max = 120) String lastName,
          @Size(max = 64) String phone,
          @Size(max = 255) String school,
          @Size(max = 32) String gradeLevel,
          String status
  ) {}

  public record AdminUserUpdateRequest(
          @Email @NotBlank String email,
          @NotEmpty List<String> roles,
          @Size(max = 120) String firstName,
          @Size(max = 120) String lastName,
          @Size(max = 64) String phone,
          @Size(max = 255) String school,
          @Size(max = 32) String gradeLevel,
          String status
  ) {}
}
