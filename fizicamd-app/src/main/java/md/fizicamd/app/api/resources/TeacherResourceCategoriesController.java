package md.fizicamd.app.api.resources;

import jakarta.validation.Valid;
import md.fizicamd.app.api.resources.ResourceDtos.CategoryDto;
import md.fizicamd.app.api.resources.ResourceDtos.CategoryUpsertRequest;
import md.fizicamd.app.api.resources.ResourceDtos.GroupUpdateRequest;
import md.fizicamd.app.resources.ResourceService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teacher/resource-categories")
@PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
public class TeacherResourceCategoriesController {

  private final ResourceService resourceService;
  private final ResourceMapper mapper;

  public TeacherResourceCategoriesController(ResourceService resourceService, ResourceMapper mapper) {
    this.resourceService = resourceService;
    this.mapper = mapper;
  }

  @GetMapping
  public List<CategoryDto> list() {
    return resourceService.listCategories().stream()
      .map(mapper::toCategory)
      .toList();
  }

  @PostMapping
  public CategoryDto create(@Valid @RequestBody CategoryUpsertRequest request) {
    var category = resourceService.createCategory(request.label(), request.group(), request.sortOrder(), request.groupOrder());
    return mapper.toCategory(category);
  }

  @PutMapping("/{code}")
  public CategoryDto update(
    @PathVariable String code,
    @Valid @RequestBody CategoryUpsertRequest request
  ) {
    var category = resourceService.updateCategory(code, request.label(), request.group(), request.sortOrder(), request.groupOrder());
    return mapper.toCategory(category);
  }

  @DeleteMapping("/{code}")
  public void delete(@PathVariable String code) {
    resourceService.deleteCategory(code);
  }

  @PutMapping("/groups/{groupLabel}")
  public List<CategoryDto> updateGroup(
    @PathVariable String groupLabel,
    @Valid @RequestBody GroupUpdateRequest request
  ) {
    return resourceService.updateGroup(groupLabel, request.label(), request.groupOrder()).stream()
      .map(mapper::toCategory)
      .toList();
  }
}
