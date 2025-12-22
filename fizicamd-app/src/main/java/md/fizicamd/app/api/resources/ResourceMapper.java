package md.fizicamd.app.api.resources;

import md.fizicamd.app.api.resources.ResourceDtos.CategoryDto;
import md.fizicamd.app.api.resources.ResourceDtos.ResourceBlockDto;
import md.fizicamd.app.api.resources.ResourceDtos.ResourceCardDto;
import md.fizicamd.app.api.resources.ResourceDtos.ResourceDetailDto;
import md.fizicamd.app.media.MediaService;
import md.fizicamd.app.resources.ResourceContentBlock;
import md.fizicamd.app.resources.ResourceEntry;
import md.fizicamd.app.resources.ResourceCategory;
import md.fizicamd.app.resources.ResourceService;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ResourceMapper {
  private final ResourceService resourceService;

  public ResourceMapper(ResourceService resourceService) {
    this.resourceService = resourceService;
  }

  public ResourceCardDto toCard(ResourceEntry entry) {
    var category = toCategory(entry.getCategoryCode());
    return new ResourceCardDto(
      entry.getId(),
      entry.getTitle(),
      entry.getSlug(),
      entry.getSummary(),
      category,
      assetUrl(entry.getAvatarMediaId()),
      resourceService.readTags(entry),
      resourceService.authorDisplayName(entry.getAuthorId()),
      entry.getPublishedAt(),
      entry.getStatus()
    );
  }

  public ResourceDetailDto toDetail(ResourceEntry entry) {
    var blocks = resourceService.readBlocks(entry).stream().map(this::toBlock).toList();
    return new ResourceDetailDto(
      entry.getId(),
      entry.getTitle(),
      entry.getSlug(),
      entry.getSummary(),
      toCategory(entry.getCategoryCode()),
      assetUrl(entry.getAvatarMediaId()),
      entry.getAvatarMediaId(),
      resourceService.readTags(entry),
      resourceService.authorDisplayName(entry.getAuthorId()),
      entry.getPublishedAt(),
      entry.getStatus(),
      blocks
    );
  }

  public CategoryDto toCategory(String code) {
    return resourceService.findCategory(code)
      .map(this::toCategory)
      .orElseGet(() -> new CategoryDto(code, code, "", 0, 0));
  }

  public CategoryDto toCategory(ResourceCategory cat) {
    if (cat == null) {
      return null;
    }
    return new CategoryDto(
      cat.getCode(),
      cat.getLabel(),
      cat.getGroupLabel(),
      cat.getSortOrder(),
      cat.getGroupOrder()
    );
  }

  private ResourceBlockDto toBlock(ResourceContentBlock block) {
    return new ResourceBlockDto(
      block.type(),
      block.text(),
      block.url(),
      block.assetId(),
      assetUrl(block.assetId()),
      block.caption(),
      block.title()
    );
  }

  private String assetUrl(java.util.UUID assetId) {
    return assetId == null ? null : MediaService.buildAssetUrl(assetId);
  }
}
