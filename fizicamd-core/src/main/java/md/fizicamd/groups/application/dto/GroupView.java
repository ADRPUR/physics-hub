package md.fizicamd.groups.application.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record GroupView(
        UUID id,
        String name,
        Integer grade,
        Integer year,
        Instant createdAt,
        List<GroupMemberView> members
) {}
