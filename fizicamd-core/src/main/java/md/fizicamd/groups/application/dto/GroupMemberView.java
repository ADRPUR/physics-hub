package md.fizicamd.groups.application.dto;

import java.util.UUID;

public record GroupMemberView(
        UUID userId,
        String email,
        String memberRole
) {}
