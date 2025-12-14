package md.fizicamd.app.api.admin;

import md.fizicamd.app.api.admin.dto.AdminUserDtos;
import md.fizicamd.app.api.admin.dto.AdminUserDtos.AdminUserCreateRequest;
import md.fizicamd.app.api.admin.dto.AdminUserDtos.AdminUserResponse;
import md.fizicamd.app.api.admin.dto.AdminUserDtos.AdminUserUpdateRequest;
import md.fizicamd.app.api.admin.dto.AssignRoleRequest;
import md.fizicamd.app.api.admin.dto.PagedResponse;
import md.fizicamd.app.identity.JpaUserRepository;
import md.fizicamd.app.media.MediaService;
import md.fizicamd.identity.application.AdminUserService;
import md.fizicamd.identity.application.IdentityService;
import md.fizicamd.identity.application.UserProfileRepository;
import md.fizicamd.identity.application.UserRepository;
import md.fizicamd.identity.domain.Profile.UserProfile;
import md.fizicamd.identity.domain.User;
import md.fizicamd.identity.domain.UserStatus;
import md.fizicamd.shared.NotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUsersController {

  private static final int MAX_PAGE_SIZE = 100;

  private final IdentityService identityService;
  private final UserRepository userRepository;
  private final UserProfileRepository profileRepository;
  private final JpaUserRepository jpaUserRepository;
  private final AdminUserService admin;
  private final MediaService mediaService;

  public AdminUsersController(
          IdentityService identityService,
          UserRepository userRepository,
          UserProfileRepository profileRepository,
          JpaUserRepository jpaUserRepository,
          AdminUserService admin,
          MediaService mediaService
  ) {
    this.identityService = identityService;
    this.userRepository = userRepository;
    this.profileRepository = profileRepository;
    this.jpaUserRepository = jpaUserRepository;
    this.admin = admin;
    this.mediaService = mediaService;
  }

  @GetMapping
  public PagedResponse<AdminUserResponse> list(
          @RequestParam(defaultValue = "1") int page,
          @RequestParam(defaultValue = "10") int pageSize,
          @RequestParam(required = false) String search
  ) {
    var pageable = buildPageable(page, pageSize);
    Page<User> result = (search != null && !search.isBlank())
            ? jpaUserRepository.findByEmailContainingIgnoreCase(search.trim(), pageable)
            : jpaUserRepository.findAll(pageable);

    var roleMap = loadUsersWithRoles(result.getContent());
    var profileMap = loadProfiles(result.getContent());
    var items = result.getContent().stream()
            .map(user -> AdminUserResponse.from(roleMap.getOrDefault(user.getId(), user), profileMap.get(user.getId())))
            .toList();

    return new PagedResponse<>(items, result.getTotalElements(), page, pageSize);
  }

  @PostMapping
  public AdminUserResponse create(@RequestBody @Validated AdminUserCreateRequest req) {
    var user = identityService.createUser(req.email(), req.password());
    applyStatus(user, req.status());
    userRepository.save(user);

    syncRoles(user.getId(), req.roles());
    var profile = saveProfile(user.getId(), req.firstName(), req.lastName(), req.phone(), req.school(), req.gradeLevel());

    var refreshed = jpaUserRepository.findWithRolesById(user.getId()).orElseThrow();
    return AdminUserResponse.from(refreshed, profile);
  }

  @PutMapping("/{id}")
  public AdminUserResponse update(
          @PathVariable UUID id,
          @RequestBody @Validated AdminUserUpdateRequest req
  ) {
    var user = userRepository.findById(id).orElseThrow(() -> new NotFoundException("User not found"));
    if (!user.getEmail().equalsIgnoreCase(req.email())) {
      throw new IllegalArgumentException("Email-ul nu poate fi modificat.");
    }
    applyStatus(user, req.status());
    userRepository.save(user);

    syncRoles(id, req.roles());
    var profile = saveProfile(id, req.firstName(), req.lastName(), req.phone(), req.school(), req.gradeLevel());
    var refreshed = jpaUserRepository.findWithRolesById(id).orElseThrow();
    return AdminUserResponse.from(refreshed, profile);
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable UUID id) {
    profileRepository.findById(id).ifPresent(profile -> {
      if (profile.getAvatarMediaId() != null) {
        mediaService.deleteAsset(profile.getAvatarMediaId());
      }
    });
    identityService.deleteUser(id);
  }

  @PostMapping("/{userId}/roles")
  public ResponseEntity<?> assignRole(@PathVariable UUID userId, @RequestBody AssignRoleRequest req) {
    admin.assignRole(userId, req.role());
    return ResponseEntity.noContent().build();
  }

  @DeleteMapping("/{userId}/roles/{role}")
  public ResponseEntity<?> removeRole(@PathVariable UUID userId, @PathVariable String role) {
    admin.removeRole(userId, role);
    return ResponseEntity.noContent().build();
  }

  private Pageable buildPageable(int page, int size) {
    int pageIndex = Math.max(page, 1) - 1;
    int pageSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
    return PageRequest.of(pageIndex, pageSize, Sort.by(Sort.Direction.DESC, "createdAt"));
  }

  private Map<UUID, UserProfile> loadProfiles(List<User> users) {
    if (users.isEmpty()) return Collections.emptyMap();
    var ids = users.stream().map(User::getId).collect(Collectors.toSet());
    return profileRepository.findByIds(ids).stream()
            .collect(Collectors.toMap(UserProfile::getUserId, p -> p));
  }

  private Map<UUID, User> loadUsersWithRoles(List<User> users) {
    if (users.isEmpty()) return Collections.emptyMap();
    var ids = users.stream().map(User::getId).collect(Collectors.toSet());
    return jpaUserRepository.findByIdIn(ids).stream()
            .collect(Collectors.toMap(User::getId, u -> u));
  }

  private void syncRoles(UUID userId, List<String> roles) {
    var desired = (roles == null || roles.isEmpty())
            ? Set.of("STUDENT")
            : roles.stream().map(r -> r.toUpperCase(Locale.ROOT)).collect(Collectors.toSet());

    var user = jpaUserRepository.findWithRolesById(userId).orElseThrow();
    var current = user.getRoles().stream()
            .map(ur -> ur.getRole().getCode().name())
            .collect(Collectors.toSet());

    for (var role : desired) {
      if (!current.contains(role)) {
        admin.assignRole(userId, role);
      }
    }
    for (var role : current) {
      if (!desired.contains(role)) {
        admin.removeRole(userId, role);
      }
    }
  }

  private void applyStatus(User user, String status) {
    if (status == null || status.isBlank()) return;
    user.setStatus(UserStatus.valueOf(status.toUpperCase(Locale.ROOT)));
  }

  private UserProfile saveProfile(UUID userId, String firstName, String lastName, String phone, String school, String gradeLevel) {
    var profile = profileRepository.findById(userId).orElseGet(() -> new UserProfile(userId));
    profile.setFirstName(firstName);
    profile.setLastName(lastName);
    profile.setPhone(phone);
    profile.setSchool(school);
    profile.setGradeLevel(gradeLevel);
    return profileRepository.save(profile);
  }
}
