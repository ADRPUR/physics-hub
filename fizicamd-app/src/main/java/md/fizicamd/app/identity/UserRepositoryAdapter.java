package md.fizicamd.app.identity;

import md.fizicamd.identity.application.UserRepository;
import md.fizicamd.identity.domain.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
public class UserRepositoryAdapter implements UserRepository {
    private final JpaUserRepository repo;

    public UserRepositoryAdapter(JpaUserRepository repo) {
        this.repo = repo;
    }

    @Override
  public Optional<User> findById(UUID id) {
    return repo.findById(id);
  }

  @Override
  public Optional<User> findWithRolesById(UUID id) {
    return repo.findWithRolesById(id);
  }

  @Override
  public Optional<User> findByEmail(String email) {
    return repo.findByEmail(email.toLowerCase());
  }

    @Override
    public Optional<User> findWithRolesByEmail(String email) {
        return repo.findWithRolesByEmail(email.toLowerCase());
    }

    @Override
    public User save(User user) {
        return repo.save(user);
    }

    @Override
    public void deleteById(UUID id) {
        repo.deleteById(id);
    }

    @Override
    public boolean existsByEmail(String email) {
        return repo.existsByEmail(email.toLowerCase());
    }
}
