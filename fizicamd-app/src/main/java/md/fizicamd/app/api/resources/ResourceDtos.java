package md.fizicamd.app.api.resources;

import jakarta.validation.constraints.NotBlank;
import md.fizicamd.app.resources.ResourceBlockType;
import md.fizicamd.app.resources.ResourceStatus;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class ResourceDtos {

  public record CategoryDto(
    String code,
    String label,
    String group,
    int sortOrder,
    int groupOrder
  ) {}

  public record ResourceBlockDto(
    ResourceBlockType type,
    String text,
    String url,
    UUID assetId,
    String mediaUrl,
    String caption,
    String title
  ) {}

  public record ResourceCardDto(
    UUID id,
    String title,
    String slug,
    String summary,
    CategoryDto category,
    String avatarUrl,
    List<String> tags,
    String authorName,
    Instant publishedAt,
    ResourceStatus status
  ) {}

  public record ResourceDetailDto(
    UUID id,
    String title,
    String slug,
    String summary,
    CategoryDto category,
    String avatarUrl,
    UUID avatarAssetId,
    List<String> tags,
    String authorName,
    Instant publishedAt,
    ResourceStatus status,
    List<ResourceBlockDto> blocks
  ) {}

  public record ResourceListResponse(List<ResourceCardDto> items, long total, int page, int size) {}

  public record TeacherResourceListResponse(List<ResourceCardDto> items) {}

  public record CreateResourceRequest(
    @NotBlank String categoryCode,
    @NotBlank String title,
    @NotBlank String summary,
    UUID avatarAssetId,
    List<String> tags,
    List<ResourceBlockInput> blocks,
    ResourceStatus status
  ) {}

  public record UpdateResourceRequest(
    @NotBlank String categoryCode,
    @NotBlank String title,
    @NotBlank String summary,
    UUID avatarAssetId,
    List<String> tags,
    List<ResourceBlockInput> blocks,
    ResourceStatus status
  ) {}

  public record ResourceBlockInput(
    ResourceBlockType type,
    String text,
    String url,
    UUID assetId,
    String caption,
    String title
  ) {}

  public record CategoryUpsertRequest(
    @NotBlank String label,
    @NotBlank String group,
    Integer sortOrder,
    Integer groupOrder
  ) {}

  public record GroupUpdateRequest(
    @NotBlank String label,
    Integer groupOrder
  ) {}
}
