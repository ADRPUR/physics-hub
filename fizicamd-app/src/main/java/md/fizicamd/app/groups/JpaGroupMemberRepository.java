package md.fizicamd.app.groups;

import md.fizicamd.groups.domain.GroupMember;
import md.fizicamd.groups.domain.GroupMemberRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JpaGroupMemberRepository extends JpaRepository<GroupMember, UUID> {

    @Query("select gm from GroupMember gm where gm.group.id = :groupId and gm.user.id = :userId")
    Optional<GroupMember> findByGroupIdAndUserId(UUID groupId, UUID userId);

    @Query("select gm from GroupMember gm where gm.user.id = :userId")
    List<GroupMember> findAllByUserId(UUID userId);

    @Query("""
    select case when count(gm) > 0 then true else false end
    from GroupMember gm
    where gm.group.id = :groupId and gm.user.id = :userId and gm.memberRole = :role
  """)
    boolean existsInGroupAs(UUID groupId, UUID userId, GroupMemberRole role);
}
