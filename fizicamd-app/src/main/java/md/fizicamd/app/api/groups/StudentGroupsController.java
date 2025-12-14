package md.fizicamd.app.api.groups;

import md.fizicamd.app.api.groups.dto.GroupResponse;
import md.fizicamd.app.security.CurrentUser;
import md.fizicamd.groups.application.GroupService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/student/groups")
public class StudentGroupsController {

    private final GroupService groups;

    public StudentGroupsController(GroupService groups) {
        this.groups = groups;
    }

    @GetMapping
    @PreAuthorize("hasRole('STUDENT')")
    public List<GroupResponse> myGroups() {
        return groups.myGroups(CurrentUser.id())
                .stream()
                .map(GroupApiMapper::toResponse)
                .toList();
    }

    @GetMapping("/{groupId}")
    @PreAuthorize("hasRole('STUDENT')")
    public GroupResponse get(@PathVariable UUID groupId) {
        var view = groups.getGroup(groupId, CurrentUser.id(), true);
        return GroupApiMapper.toResponse(view);
    }
}
