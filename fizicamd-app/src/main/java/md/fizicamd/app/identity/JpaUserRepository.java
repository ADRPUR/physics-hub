package md.fizicamd.app.identity;

import md.fizicamd.identity.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JpaUserRepository extends JpaRepository<User, UUID> {
  Optional<User> findByEmail(String email);
  boolean existsByEmail(String email);
  @EntityGraph(attributePaths = {"roles", "roles.role"})
  Optional<User> findWithRolesByEmail(String email);
  @EntityGraph(attributePaths = {"roles", "roles.role"})
  Optional<md.fizicamd.identity.domain.User> findWithRolesById(UUID id);
  Page<User> findAll(Pageable pageable);
  Page<User> findByEmailContainingIgnoreCase(String email, Pageable pageable);
  @EntityGraph(attributePaths = {"roles", "roles.role"})
  List<User> findByIdIn(Collection<UUID> ids);
}
