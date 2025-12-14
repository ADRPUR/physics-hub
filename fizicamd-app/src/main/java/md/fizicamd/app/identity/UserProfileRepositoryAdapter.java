package md.fizicamd.app.identity;

import md.fizicamd.identity.application.UserProfileRepository;
import md.fizicamd.identity.domain.Profile.UserProfile;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
public class UserProfileRepositoryAdapter implements UserProfileRepository {
  private final JpaUserProfileRepository repo;

  public UserProfileRepositoryAdapter(JpaUserProfileRepository repo) {
    this.repo = repo;
  }

  @Override
  public Optional<UserProfile> findById(UUID userId) {
    return repo.findById(userId);
  }

  @Override
  public UserProfile save(UserProfile profile) {
    return repo.save(profile);
  }

  @Override
  public void deleteById(UUID userId) {
    repo.deleteById(userId);
  }

  @Override
  public List<UserProfile> findByIds(Collection<UUID> ids) {
    return repo.findByUserIdIn(ids);
  }
}
