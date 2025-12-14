package md.fizicamd.app.api.navigation;

import md.fizicamd.app.navigation.JpaNavigationRepository;
import md.fizicamd.navigation.domain.NavigationItem;
import md.fizicamd.navigation.domain.Visibility;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/navigation")
public class NavigationController {
  private final JpaNavigationRepository repo;

  public NavigationController(JpaNavigationRepository repo) {
    this.repo = repo;
  }

  @GetMapping("/public")
  public List<NavigationItem> publicNav() {
    return repo.findAllByVisibilityOrderBySortOrderAsc(Visibility.PUBLIC);
  }
}
