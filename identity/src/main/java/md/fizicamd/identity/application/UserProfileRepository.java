package md.fizicamd.identity.application;

import md.fizicamd.identity.domain.Profile.UserProfile;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserProfileRepository {
  Optional<UserProfile> findById(UUID userId);
  UserProfile save(UserProfile profile);
  void deleteById(UUID userId);
  List<UserProfile> findByIds(Collection<UUID> ids);
}
