package md.fizicamd.app.api.publicsite;

import md.fizicamd.app.api.publicsite.HomepageDtos.SearchResultItem;
import md.fizicamd.app.resources.ResourceEntry;
import md.fizicamd.app.resources.ResourceService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PublicContentService {
  private final ResourceService resourceService;

  public PublicContentService(ResourceService resourceService) {
    this.resourceService = resourceService;
  }

  public List<SearchResultItem> searchNavigation(String rawQuery) {
    var term = Optional.ofNullable(rawQuery).map(String::trim).orElse("");
    if (term.isBlank()) {
      return List.of();
    }
    var results = resourceService.searchPublished(term, 20);

    return results.stream()
      .map(this::mapResource)
      .toList();
  }

  private SearchResultItem mapResource(ResourceEntry entry) {
    return new SearchResultItem(
      entry.getId(),
      entry.getTitle(),
      entry.getSlug(),
      null,
      "RESOURCE",
      null
    );
  }
}
