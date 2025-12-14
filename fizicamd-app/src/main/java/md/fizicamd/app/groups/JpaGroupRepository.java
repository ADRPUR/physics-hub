package md.fizicamd.app.groups;

import md.fizicamd.groups.domain.Group;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface JpaGroupRepository extends JpaRepository<Group, UUID> {

    @EntityGraph(attributePaths = {"members", "members.user"})
    Optional<Group> findWithMembersById(UUID id);

    Optional<Group> findByName(String name);
}
