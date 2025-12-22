package md.fizicamd.app.api.resources;

import jakarta.validation.Valid;
import md.fizicamd.app.api.resources.ResourceDtos;
import md.fizicamd.app.api.resources.ResourceDtos.CreateResourceRequest;
import md.fizicamd.app.api.resources.ResourceDtos.TeacherResourceListResponse;
import md.fizicamd.app.api.resources.ResourceDtos.ResourceDetailDto;
import md.fizicamd.app.api.resources.ResourceDtos.UpdateResourceRequest;
import md.fizicamd.app.resources.ResourceContentBlock;
import md.fizicamd.app.resources.ResourceCreateCommand;
import md.fizicamd.app.resources.ResourceService;
import md.fizicamd.shared.NotFoundException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/teacher/resources")
@PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
public class TeacherResourcesController {
  private final ResourceService resourceService;
  private final ResourceMapper mapper;

  public TeacherResourcesController(ResourceService resourceService, ResourceMapper mapper) {
    this.resourceService = resourceService;
    this.mapper = mapper;
  }

  @GetMapping
  public TeacherResourceListResponse myResources(Authentication auth) {
    var userId = currentUserId(auth);
    var items = resourceService.listByAuthor(userId, canManageOthers(auth)).stream()
      .map(mapper::toCard)
      .toList();
    return new TeacherResourceListResponse(items);
  }

  @PostMapping
  public ResourceDtos.ResourceDetailDto create(
    Authentication auth,
    @Valid @RequestBody CreateResourceRequest request
  ) {
    var entry = resourceService.createResource(currentUserId(auth), toCommand(request));
    return mapper.toDetail(entry);
  }

  @GetMapping("/{resourceId}")
  public ResourceDetailDto detail(@PathVariable UUID resourceId, Authentication auth) {
    var entry = resourceService.findById(resourceId);
    ensureOwnership(entry.getAuthorId(), auth);
    return mapper.toDetail(entry);
  }

  @PutMapping("/{resourceId}")
  public ResourceDetailDto update(
    @PathVariable UUID resourceId,
    Authentication auth,
    @Valid @RequestBody UpdateResourceRequest request
  ) {
    var entry = resourceService.updateResource(resourceId, currentUserId(auth), canManageOthers(auth), toCommand(request));
    return mapper.toDetail(entry);
  }

  @DeleteMapping("/{resourceId}")
  public void delete(@PathVariable UUID resourceId, Authentication auth) {
    resourceService.deleteResource(resourceId, currentUserId(auth), canManageOthers(auth));
  }

  private ResourceCreateCommand toCommand(CreateResourceRequest req) {
    List<ResourceContentBlock> blocks = req.blocks() == null ? List.of() : req.blocks().stream()
      .map(block -> new ResourceContentBlock(block.type(), block.text(), block.url(), block.assetId(), block.caption(), block.title()))
      .toList();
    return new ResourceCreateCommand(
      req.categoryCode(),
      req.title(),
      req.summary(),
      req.avatarAssetId(),
      req.tags(),
      blocks,
      req.status()
    );
  }

  private ResourceCreateCommand toCommand(UpdateResourceRequest req) {
    List<ResourceContentBlock> blocks = req.blocks() == null ? List.of() : req.blocks().stream()
      .map(block -> new ResourceContentBlock(block.type(), block.text(), block.url(), block.assetId(), block.caption(), block.title()))
      .toList();
    return new ResourceCreateCommand(
      req.categoryCode(),
      req.title(),
      req.summary(),
      req.avatarAssetId(),
      req.tags(),
      blocks,
      req.status()
    );
  }

  private UUID currentUserId(Authentication auth) {
    var id = auth != null ? auth.getDetails() : null;
    if (id instanceof UUID uuid) {
      return uuid;
    }
    if (id instanceof String str) {
      return UUID.fromString(str);
    }
    throw new NotFoundException("User context missing");
  }

  private boolean canManageOthers(Authentication auth) {
    return auth != null && auth.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
  }

  private void ensureOwnership(UUID authorId, Authentication auth) {
    if (authorId == null) {
      throw new NotFoundException("Resursa nu a fost găsită.");
    }
    if (canManageOthers(auth)) {
      return;
    }
    if (!authorId.equals(currentUserId(auth))) {
      throw new NotFoundException("Resursa nu a fost găsită.");
    }
  }
}
