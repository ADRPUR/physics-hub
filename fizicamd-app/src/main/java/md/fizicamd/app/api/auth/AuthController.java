package md.fizicamd.app.api.auth;

import md.fizicamd.app.groups.RoleGroupService;
import md.fizicamd.app.security.JwtService;
import md.fizicamd.app.api.shared.UserMapper;
import md.fizicamd.identity.application.IdentityService;
import md.fizicamd.identity.application.PasswordHasher;
import md.fizicamd.identity.application.UserProfileRepository;
import md.fizicamd.identity.application.UserRepository;
import md.fizicamd.identity.domain.Profile.UserProfile;
import md.fizicamd.identity.domain.UserStatus;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;

import static md.fizicamd.app.api.auth.AuthDtos.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private static final long ACCESS_TTL_SECONDS = 14_400L;
  private static final long REFRESH_TTL_SECONDS = 1_209_600L; // 14 days

  private final IdentityService identityService;
  private final UserRepository userRepository;
  private final UserProfileRepository profileRepository;
  private final PasswordHasher passwordHasher;
  private final JwtService jwtService;
  private final RoleGroupService roleGroupService;

  public AuthController(
          IdentityService identityService,
          UserRepository userRepository,
          UserProfileRepository profileRepository,
          PasswordHasher passwordHasher,
          JwtService jwtService,
          RoleGroupService roleGroupService
  ) {
    this.identityService = identityService;
    this.userRepository = userRepository;
    this.profileRepository = profileRepository;
    this.passwordHasher = passwordHasher;
    this.jwtService = jwtService;
    this.roleGroupService = roleGroupService;
  }

  @PostMapping("/register")
  public RegisterResponse register(@RequestBody @Validated RegisterRequest req) {
    var user = identityService.createUser(req.email(), req.password());
    // For MVP: activate immediately (later: email verification flow)
    user.setStatus(UserStatus.ACTIVE);
    userRepository.save(user);
    profileRepository.save(applyProfileAttributes(new UserProfile(user.getId()), req));
    roleGroupService.ensureUserMemberships(user);

    return new RegisterResponse(user.getId().toString(), user.getEmail());
  }

  @PostMapping("/login")
  public TokenResponse login(@RequestBody @Validated LoginRequest req) {
    var user = userRepository.findWithRolesByEmail(req.email())
      .orElseThrow(AuthException::invalidCredentials);
    if (user.getStatus() != UserStatus.ACTIVE) throw AuthException.inactiveUser();
    if (!passwordHasher.matches(req.password(), user.getPasswordHash())) {
      throw AuthException.invalidCredentials();
    }

    // MVP roles: empty list (later load from DB + join roles)
    var profile = profileRepository.findById(user.getId()).orElse(null);

    var roles = user.getRoles().stream().map(ur -> ur.getRole().getCode().name()).toList();
    var access = jwtService.createAccessToken(
            user.getId(),
            user.getEmail(),
            roles,
            ACCESS_TTL_SECONDS
    );
    var refresh = jwtService.createRefreshToken(user.getId(), REFRESH_TTL_SECONDS); // 14 days
    var now = Instant.now();
    user.setLastLoginAt(now);
    user.setLastSeenAt(now);
    userRepository.save(user);

    return new TokenResponse(access, refresh, now.plusSeconds(ACCESS_TTL_SECONDS).getEpochSecond(), UserMapper.toDto(user, profile));
  }

  @GetMapping("/me")
  public MeResponse me(Authentication auth) {
    var userId = (String) auth.getDetails();
    return new MeResponse(java.util.UUID.fromString(userId), auth.getName());
  }

  public record RegisterResponse(String userId, String email) {}

  private static UserProfile applyProfileAttributes(
          UserProfile profile,
          RegisterRequest req
  ) {
    profile.setFirstName(req.firstName());
    profile.setLastName(req.lastName());
    profile.setPhone(req.phone());
    profile.setSchool(req.school());
    profile.setGradeLevel(req.gradeLevel());
    profile.setBirthDate(parseDate(req.birthDate()));
    return profile;
  }

  private static LocalDate parseDate(String birthDate) {
    if (birthDate == null || birthDate.isBlank()) {
      return null;
    }
    return LocalDate.parse(birthDate);
  }
}
