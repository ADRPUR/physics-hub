package md.fizicamd.app.api.admin.dto;

import java.util.List;

public record PagedResponse<T>(List<T> items, long total, int page, int pageSize) {}
