package md.fizicamd.app.api.publicsite;

import md.fizicamd.app.api.publicsite.HomepageDtos.HomepageResponse;
import md.fizicamd.app.api.publicsite.HomepageDtos.SearchResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public")
public class PublicContentController {
  private final PublicContentService service;

  public PublicContentController(PublicContentService service) {
    this.service = service;
  }

  @GetMapping("/homepage")
  public HomepageResponse homepage() {
    return service.fetchHomepage();
  }

  @GetMapping("/search")
  public SearchResponse search(@RequestParam(name = "q", required = false) String query) {
    return new SearchResponse(service.searchNavigation(query));
  }
}
