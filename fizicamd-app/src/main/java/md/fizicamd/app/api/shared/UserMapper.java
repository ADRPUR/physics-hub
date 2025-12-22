package md.fizicamd.app.api.shared;

import md.fizicamd.identity.domain.Profile.UserProfile;
import md.fizicamd.identity.domain.User;

import java.time.format.DateTimeFormatter;
import static md.fizicamd.app.api.shared.UserRepresentation.ProfileDto;
import static md.fizicamd.app.api.shared.UserRepresentation.UserDto;

public final class UserMapper {
  private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ISO_LOCAL_DATE;

  private UserMapper() {}

  public static UserDto toDto(User user, UserProfile profile) {
    var roles = user.getRoles().stream()
            .map(ur -> ur.getRole().getCode().name())
            .toList();
    var primaryRole = roles.isEmpty() ? "STUDENT" : roles.get(0);

    ProfileDto profileDto = null;
    if (profile != null) {
      profileDto = new ProfileDto(
              profile.getFirstName(),
              profile.getLastName(),
              profile.getBirthDate() != null ? DATE_FORMAT.format(profile.getBirthDate()) : null,
              profile.getGender(),
              profile.getPhone(),
              profile.getSchool(),
              profile.getGradeLevel(),
              profile.getBio(),
              profile.getAvatarMediaId() != null ? md.fizicamd.app.media.MediaService.buildAssetUrl(profile.getAvatarMediaId()) : null
      );
    }

    return new UserDto(
            user.getId(),
            user.getEmail(),
            user.getStatus().name(),
            primaryRole,
            roles,
            user.getLastLoginAt(),
            profileDto
    );
  }
}
