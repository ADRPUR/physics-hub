package md.fizicamd.app.groups;

import md.fizicamd.groups.domain.Group;
import md.fizicamd.groups.domain.GroupMember;
import md.fizicamd.groups.domain.GroupMemberRole;
import md.fizicamd.identity.domain.RoleCode;
import md.fizicamd.identity.domain.User;
import md.fizicamd.identity.domain.UserRole;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Arrays;
import java.util.UUID;

@Service
public class RoleGroupService {
    private final JpaGroupRepository groups;
    private final JpaGroupMemberRepository members;

    public RoleGroupService(JpaGroupRepository groups, JpaGroupMemberRepository members) {
        this.groups = groups;
        this.members = members;
    }

    @Transactional
    public void ensureUserMemberships(User user) {
        user.getRoles().stream()
                .map(UserRole::getRole)
                .map(role -> role.getCode())
                .forEach(code -> ensureMembership(user, code));
    }

    @Transactional
    public void ensureMembership(User user, RoleCode code) {
        var group = ensureRoleGroup(code);
        var existing = members.findByGroupIdAndUserId(group.getId(), user.getId());
        if (existing.isPresent()) {
            return;
        }
        members.save(new GroupMember(
                UUID.randomUUID(),
                group,
                user,
                mapToMemberRole(code)
        ));
    }

    @Transactional
    public Group ensureRoleGroup(RoleCode code) {
        var name = roleGroupName(code);
        return groups.findByName(name)
                .orElseGet(() -> {
                    var group = new Group(UUID.randomUUID(), name, null, null, Instant.now());
                    group.setDescription("System generated group for role %s".formatted(code.name()));
                    group.setVisibility("SYSTEM");
                    return groups.save(group);
                });
    }

    @Transactional
    public void ensureAllRoleGroupsExist() {
        Arrays.stream(RoleCode.values()).forEach(this::ensureRoleGroup);
    }

    private static GroupMemberRole mapToMemberRole(RoleCode code) {
        try {
            return GroupMemberRole.valueOf(code.name());
        } catch (IllegalArgumentException ex) {
            throw new IllegalStateException("Cannot map RoleCode " + code + " to GroupMemberRole", ex);
        }
    }

    private static String roleGroupName(RoleCode code) {
        return "Role: " + code.name();
    }
}
