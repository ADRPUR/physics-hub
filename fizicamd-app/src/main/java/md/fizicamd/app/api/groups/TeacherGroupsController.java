package md.fizicamd.app.api.groups;

import md.fizicamd.app.api.groups.dto.AddMemberRequest;
import md.fizicamd.app.api.groups.dto.GroupResponse;
import md.fizicamd.app.api.groups.dto.UpdateGroupRequest;
import md.fizicamd.app.security.CurrentUser;
import md.fizicamd.groups.application.GroupService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/teacher/groups")
public class TeacherGroupsController {

    private final GroupService groups;

    public TeacherGroupsController(GroupService groups) {
        this.groups = groups;
    }

    @GetMapping
    @PreAuthorize("hasRole('TEACHER')")
    public List<GroupResponse> myGroups() {
        return groups.myGroups(CurrentUser.id())
                .stream()
                .map(GroupApiMapper::toResponse)
                .toList();
    }

    @GetMapping("/{groupId}")
    @PreAuthorize("hasRole('TEACHER')")
    public GroupResponse get(@PathVariable UUID groupId) {
        var view = groups.getGroup(groupId, CurrentUser.id(), true);
        return GroupApiMapper.toResponse(view);
    }

    @PutMapping("/{groupId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> update(@PathVariable UUID groupId, @RequestBody UpdateGroupRequest req) {
        groups.updateGroup(groupId, req.name(), req.grade(), req.year(), CurrentUser.id(), false);
        return ResponseEntity.noContent().build();
    }

    // teacher adds STUDENT only (enforced in service)
    @PostMapping("/{groupId}/members")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> addMember(@PathVariable UUID groupId, @RequestBody AddMemberRequest req) {
        groups.addMember(groupId, req.userId(), req.memberRole(), CurrentUser.id(), false);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{groupId}/members/{userId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> removeMember(@PathVariable UUID groupId, @PathVariable UUID userId) {
        groups.removeMember(groupId, userId, CurrentUser.id(), false);
        return ResponseEntity.noContent().build();
    }
}
