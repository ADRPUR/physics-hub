package md.fizicamd.identity.application;

import md.fizicamd.identity.domain.RoleCode;
import md.fizicamd.identity.domain.User;
import md.fizicamd.identity.domain.UserRole;
import md.fizicamd.identity.domain.UserStatus;
import md.fizicamd.shared.NotFoundException;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

public class IdentityService {
  private final UserRepository userRepository;
  private final PasswordHasher passwordHasher;
  private final RoleRepository roleRepository;

  public IdentityService(
          UserRepository userRepository,
          PasswordHasher passwordHasher,
          RoleRepository roleRepository
  ) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
    this.roleRepository = roleRepository;
  }

  @Transactional
  public User createUser(String email, String rawPassword) {
    if (userRepository.existsByEmail(email.toLowerCase())) {
      throw new IllegalArgumentException("Email already exists");
    }
    var user = new User(
            UUID.randomUUID(),
            email,
            passwordHasher.hash(rawPassword),
            UserStatus.PENDING_VERIFICATION,
            Instant.now()
    );

// default role = STUDENT
    var studentRole = roleRepository.findByCode(RoleCode.STUDENT)
            .orElseThrow(() -> new IllegalStateException("STUDENT role not found"));

    user.getRoles().add(
            new UserRole(UUID.randomUUID(), user, studentRole)
    );

    return userRepository.save(user);
  }

  @Transactional(readOnly = true)
  public User getUser(UUID id) {
    return userRepository.findById(id).orElseThrow(() -> new NotFoundException("User not found"));
  }

  @Transactional
  public void disableUser(UUID id) {
    var user = getUser(id);
    user.setStatus(UserStatus.DISABLED);
    userRepository.save(user);
  }

  @Transactional
  public void deleteUser(UUID id) {
    userRepository.deleteById(id);
  }
}
