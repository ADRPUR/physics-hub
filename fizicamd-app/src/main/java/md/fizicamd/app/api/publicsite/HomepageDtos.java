package md.fizicamd.app.api.publicsite;

import java.util.List;
import java.util.UUID;

public class HomepageDtos {

  public record SearchResponse(List<SearchResultItem> items) {}

  public record SearchResultItem(
    UUID id,
    String title,
    String slug,
    String href,
    String type,
    UUID parentId
  ) {}
}
