package md.fizicamd.app.identity;

import md.fizicamd.identity.domain.Profile.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface JpaUserProfileRepository extends JpaRepository<UserProfile, UUID> {
  List<UserProfile> findByUserIdIn(Collection<UUID> ids);
}
