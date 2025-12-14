package md.fizicamd.app.api.groups;

import md.fizicamd.app.api.groups.dto.*;
import md.fizicamd.app.security.CurrentUser;
import md.fizicamd.groups.application.GroupService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/groups")
public class AdminGroupsController {

    private final GroupService groups;

    public AdminGroupsController(GroupService groups) {
        this.groups = groups;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> create(@RequestBody CreateGroupRequest req) {
        UUID id = groups.createGroup(req.name(), req.grade(), req.year(), CurrentUser.id(), true);
        return ResponseEntity.created(URI.create("/api/admin/groups/" + id)).build();
    }

    @PutMapping("/{groupId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> update(@PathVariable UUID groupId, @RequestBody UpdateGroupRequest req) {
        groups.updateGroup(groupId, req.name(), req.grade(), req.year(), CurrentUser.id(), true);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{groupId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable UUID groupId) {
        groups.deleteGroup(groupId, CurrentUser.id(), true);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{groupId}/members")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addMember(@PathVariable UUID groupId, @RequestBody AddMemberRequest req) {
        groups.addMember(groupId, req.userId(), req.memberRole(), CurrentUser.id(), true);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{groupId}/members/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> removeMember(@PathVariable UUID groupId, @PathVariable UUID userId) {
        groups.removeMember(groupId, userId, CurrentUser.id(), true);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{groupId}")
    @PreAuthorize("hasRole('ADMIN')")
    public GroupResponse get(@PathVariable UUID groupId) {
        var view = groups.getGroup(groupId, CurrentUser.id(), true);
        return GroupApiMapper.toResponse(view);
    }
}
