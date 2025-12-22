package md.fizicamd.app.api.resources;

import md.fizicamd.app.api.resources.ResourceDtos.CategoryDto;
import md.fizicamd.app.api.resources.ResourceDtos.ResourceDetailDto;
import md.fizicamd.app.api.resources.ResourceDtos.ResourceListResponse;
import md.fizicamd.app.resources.ResourceService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/resources")
public class PublicResourcesController {
  private final ResourceService resourceService;
  private final ResourceMapper mapper;

  public PublicResourcesController(ResourceService resourceService, ResourceMapper mapper) {
    this.resourceService = resourceService;
    this.mapper = mapper;
  }

  @GetMapping("/categories")
  public List<CategoryDto> categories() {
    return resourceService.listCategories().stream()
      .map(cat -> new CategoryDto(
        cat.getCode(),
        cat.getLabel(),
        cat.getGroupLabel(),
        cat.getSortOrder(),
        cat.getGroupOrder()
      ))
      .toList();
  }

  @GetMapping
  public ResourceListResponse resources(
    @RequestParam(name = "category", required = false) String category,
    @RequestParam(name = "limit", defaultValue = "9") int limit,
    @RequestParam(name = "page", defaultValue = "1") int page
  ) {
    var safeLimit = Math.max(1, Math.min(limit, 30));
    var safePage = Math.max(1, page);
    var result = resourceService.listPublishedPage(category, safePage - 1, safeLimit);
    var items = result.getContent().stream()
      .map(mapper::toCard)
      .toList();
    return new ResourceListResponse(items, result.getTotalElements(), safePage, safeLimit);
  }

  @GetMapping("/{slug}")
  public ResourceDetailDto detail(@PathVariable String slug) {
    var entry = resourceService.findPublishedBySlug(slug);
    return mapper.toDetail(entry);
  }
}
