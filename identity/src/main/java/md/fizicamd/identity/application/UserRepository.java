package md.fizicamd.identity.application;

import md.fizicamd.identity.domain.User;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository {
  Optional<User> findById(UUID id);
  Optional<User> findWithRolesById(UUID id);
  Optional<User> findByEmail(String email);
  User save(User user);
  void deleteById(UUID id);
  boolean existsByEmail(String email);
  Optional<User> findWithRolesByEmail(String email);
}
