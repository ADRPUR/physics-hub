package md.fizicamd.app.groups;

import md.fizicamd.app.api.groups.dto.GroupResponse;
import md.fizicamd.app.api.groups.dto.MemberResponse;
import md.fizicamd.groups.application.GroupService;
import md.fizicamd.groups.application.dto.GroupMemberView;
import md.fizicamd.groups.application.dto.GroupView;
import md.fizicamd.groups.domain.Group;
import md.fizicamd.groups.domain.GroupMember;
import md.fizicamd.groups.domain.GroupMemberRole;
import md.fizicamd.identity.domain.User;
import md.fizicamd.app.identity.JpaUserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GroupServiceImpl implements GroupService {

    private final JpaGroupRepository groups;
    private final JpaGroupMemberRepository members;
    private final JpaUserRepository users;

    public GroupServiceImpl(JpaGroupRepository groups, JpaGroupMemberRepository members, JpaUserRepository users) {
        this.groups = groups;
        this.members = members;
        this.users = users;
    }

    @Override
    @Transactional
    public UUID createGroup(String name, Integer grade, Integer year, UUID actorId, boolean actorIsAdmin) {
        if (!actorIsAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only ADMIN can create groups");
        }
        var g = new Group(UUID.randomUUID(), name, grade, year, Instant.now());
        groups.save(g);
        return g.getId();
    }

    @Override
    @Transactional
    public void updateGroup(UUID groupId, String name, Integer grade, Integer year, UUID actorId, boolean actorIsAdmin) {
        if (!actorIsAdmin && !isTeacherInGroup(groupId, actorId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
        }
        var g = groups.findById(groupId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (name != null) g.setName(name);
        g.setGrade(grade);
        g.setYear(year);
        groups.save(g);
    }

    @Override
    @Transactional
    public void deleteGroup(UUID groupId, UUID actorId, boolean actorIsAdmin) {
        if (!actorIsAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only ADMIN can delete groups");
        }
        groups.deleteById(groupId);
    }

    @Override
    @Transactional
    public void addMember(UUID groupId, UUID userId, String memberRole, UUID actorId, boolean actorIsAdmin) {
        var role = GroupMemberRole.valueOf(memberRole.toUpperCase());

        // Policy:
        // - ADMIN can add anyone
        // - TEACHER can add/remove STUDENTS in groups where teacher
        if (!actorIsAdmin) {
            if (!isTeacherInGroup(groupId, actorId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Teacher can manage only own groups");
            }
            if (role == GroupMemberRole.TEACHER) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Teacher cannot grant TEACHER role");
            }
        }

        Group g = groups.findById(groupId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        User u = users.findById(userId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        var existing = members.findByGroupIdAndUserId(groupId, userId);
        if (existing.isPresent()) {
            // update role if admin (or keep strict)
            if (actorIsAdmin) {
                existing.get().setMemberRole(role);
                members.save(existing.get());
            }
            return;
        }

        members.save(new GroupMember(UUID.randomUUID(), g, u, role));
    }

    @Override
    @Transactional
    public void removeMember(UUID groupId, UUID userId, UUID actorId, boolean actorIsAdmin) {
        if (!actorIsAdmin) {
            if (!isTeacherInGroup(groupId, actorId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Teacher can manage only own groups");
            }
            // teacher can remove students only
            var gm = members.findByGroupIdAndUserId(groupId, userId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
            if (gm.getMemberRole() != GroupMemberRole.STUDENT) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Teacher can remove only students");
            }
            members.delete(gm);
            return;
        }

        var gm = members.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        members.delete(gm);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GroupView> myGroups(UUID actorId) {
        var all = members.findAllByUserId(actorId);
        var groupIds = all.stream().map(m -> m.getGroup().getId()).distinct().toList();

        // load with members to return full dto
        return groupIds.stream()
                .map(id -> toView(groups.findWithMembersById(id)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND))))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public GroupView getGroup(UUID groupId, UUID actorId, boolean actorIsAdmin) {
        if (!actorIsAdmin && !isMemberOfGroup(groupId, actorId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
        }
        var g = groups.findWithMembersById(groupId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return toView(g);
    }

    private boolean isMemberOfGroup(UUID groupId, UUID userId) {
        return members.findByGroupIdAndUserId(groupId, userId).isPresent();
    }

    private boolean isTeacherInGroup(UUID groupId, UUID userId) {
        return members.existsInGroupAs(groupId, userId, GroupMemberRole.TEACHER);
    }

    private static GroupView toView(Group g) {
        var members = g.getMembers().stream()
                .map(m -> new GroupMemberView(
                        m.getUser().getId(),
                        m.getUser().getEmail(),
                        m.getMemberRole().name()
                ))
                .toList();

        return new GroupView(g.getId(), g.getName(), g.getGrade(), g.getYear(), g.getCreatedAt(), members);
    }
}
