package md.fizicamd.app.api.me;

import jakarta.validation.Valid;
import md.fizicamd.app.api.shared.UserMapper;
import md.fizicamd.app.media.MediaService;
import md.fizicamd.identity.application.IdentityService;
import md.fizicamd.identity.application.UserProfileRepository;
import md.fizicamd.identity.application.UserRepository;
import md.fizicamd.identity.domain.Profile.UserProfile;
import md.fizicamd.shared.NotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

import static md.fizicamd.app.api.me.ProfileDtos.ProfileResponse;
import static md.fizicamd.app.api.me.ProfileDtos.ProfileUpdateRequest;

@RestController
@RequestMapping("/api/me")
public class MeController {
  private final UserRepository userRepository;
  private final UserProfileRepository profileRepository;
  private final IdentityService identityService;
  private final MediaService mediaService;

  public MeController(
          UserRepository userRepository,
          UserProfileRepository profileRepository,
          IdentityService identityService,
          MediaService mediaService
  ) {
    this.userRepository = userRepository;
    this.profileRepository = profileRepository;
    this.identityService = identityService;
    this.mediaService = mediaService;
  }

  @GetMapping
  public ProfileResponse me(Authentication auth) {
    var user = userRepository
            .findWithRolesById(currentUserId(auth))
            .orElseThrow(() -> new NotFoundException("User not found"));
    var profile = profileRepository.findById(user.getId()).orElse(null);
    return new ProfileResponse(UserMapper.toDto(user, profile));
  }

  @GetMapping("/profile")
  public ProfileResponse profile(Authentication auth) {
    return me(auth);
  }

  @PutMapping("/profile")
  public ProfileResponse updateProfile(@Valid @RequestBody ProfileUpdateRequest req, Authentication auth) {
    var user = userRepository
            .findWithRolesById(currentUserId(auth))
            .orElseThrow(() -> new NotFoundException("User not found"));
    var profile = profileRepository.findById(user.getId()).orElseGet(() -> new UserProfile(user.getId()));

    profile.setFirstName(req.firstName());
    profile.setLastName(req.lastName());
    profile.setGender(req.gender());
    profile.setPhone(req.phone());
    profile.setSchool(req.school());
    profile.setGradeLevel(req.gradeLevel());
    profile.setBio(req.bio());
    profile.setBirthDate(parseDate(req.birthDate()));

    profileRepository.save(profile);
    return new ProfileResponse(UserMapper.toDto(user, profile));
  }

  @DeleteMapping
  public ResponseEntity<Void> delete(Authentication auth) {
    var userId = currentUserId(auth);
    var profile = profileRepository.findById(userId).orElse(null);
    if (profile != null && profile.getAvatarMediaId() != null) {
      mediaService.deleteAsset(profile.getAvatarMediaId());
    }
    identityService.deleteUser(userId);
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/ping")
  public ResponseEntity<Void> ping(Authentication auth) {
    var user = userRepository
      .findById(currentUserId(auth))
      .orElseThrow(() -> new NotFoundException("User not found"));
    user.setLastSeenAt(java.time.Instant.now());
    userRepository.save(user);
    return ResponseEntity.noContent().build();
  }

  private static UUID currentUserId(Authentication auth) {
    var id = auth != null ? auth.getDetails() : null;
    if (id instanceof UUID uuid) {
      return uuid;
    }
    if (id instanceof String str) {
      return UUID.fromString(str);
    }
    throw new NotFoundException("User context missing");
  }

  private static LocalDate parseDate(String value) {
    if (value == null || value.isBlank()) {
      return null;
    }
    return LocalDate.parse(value);
  }
}
