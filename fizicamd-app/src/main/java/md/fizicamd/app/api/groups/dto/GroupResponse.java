package md.fizicamd.app.api.groups.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record GroupResponse(
        UUID id,
        String name,
        Integer grade,
        Integer year,
        Instant createdAt,
        List<MemberResponse> members
) {}
