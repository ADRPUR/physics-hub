package md.fizicamd.app.api.groups.dto;

import java.util.UUID;

public record AddMemberRequest(UUID userId, String memberRole) {}
