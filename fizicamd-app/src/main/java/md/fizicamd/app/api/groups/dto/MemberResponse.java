package md.fizicamd.app.api.groups.dto;

import java.util.UUID;

public record MemberResponse(
        UUID userId,
        String email,
        String memberRole
) {}
