package md.fizicamd.groups.application;

import md.fizicamd.groups.application.dto.GroupView;

import java.util.List;
import java.util.UUID;

public interface GroupService {

    UUID createGroup(String name, Integer grade, Integer year, UUID actorId, boolean actorIsAdmin);

    void updateGroup(UUID groupId, String name, Integer grade, Integer year, UUID actorId, boolean actorIsAdmin);

    void deleteGroup(UUID groupId, UUID actorId, boolean actorIsAdmin);

    void addMember(UUID groupId, UUID userId, String memberRole, UUID actorId, boolean actorIsAdmin);

    void removeMember(UUID groupId, UUID userId, UUID actorId, boolean actorIsAdmin);

    List<GroupView> myGroups(UUID actorId);

    GroupView getGroup(UUID groupId, UUID actorId, boolean actorIsAdmin);
}
