package md.fizicamd.app.api.admin;

import md.fizicamd.app.navigation.JpaNavigationRepository;
import md.fizicamd.navigation.domain.NavigationItem;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/navigation")
@PreAuthorize("hasRole('ADMIN')")
public class AdminNavigationController {
  private final JpaNavigationRepository repo;

  public AdminNavigationController(JpaNavigationRepository repo) { this.repo = repo; }

  @GetMapping
  public List<NavigationItem> list() { return repo.findAll(); }

  @PostMapping
  public NavigationItem create(@RequestBody NavigationItem item) {
    item.setId(UUID.randomUUID());
    return repo.save(item);
  }

  @PutMapping("/{id}")
  public NavigationItem update(@PathVariable UUID id, @RequestBody NavigationItem item) {
    item.setId(id);
    return repo.save(item);
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable UUID id) { repo.deleteById(id); }
}
