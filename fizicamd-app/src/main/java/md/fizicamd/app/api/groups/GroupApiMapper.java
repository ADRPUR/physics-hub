package md.fizicamd.app.api.groups;

import md.fizicamd.app.api.groups.dto.GroupResponse;
import md.fizicamd.app.api.groups.dto.MemberResponse;
import md.fizicamd.groups.application.dto.GroupMemberView;
import md.fizicamd.groups.application.dto.GroupView;

import java.util.List;

public final class GroupApiMapper {
    private GroupApiMapper() {}

    public static GroupResponse toResponse(GroupView v) {
        List<MemberResponse> members = v.members().stream()
                .map(GroupApiMapper::toMember)
                .toList();

        return new GroupResponse(
                v.id(),
                v.name(),
                v.grade(),
                v.year(),
                v.createdAt(),
                members
        );
    }

    private static MemberResponse toMember(GroupMemberView m) {
        return new MemberResponse(m.userId(), m.email(), m.memberRole());
    }
}
