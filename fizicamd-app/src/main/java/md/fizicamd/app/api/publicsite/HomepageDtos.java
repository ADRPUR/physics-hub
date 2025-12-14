package md.fizicamd.app.api.publicsite;

import java.util.List;
import java.util.UUID;

public class HomepageDtos {

  public record HomepageResponse(
    HeroBlock hero,
    List<FeatureCard> features,
    List<SpotlightCard> spotlights
  ) {}

  public record HeroBlock(
    String title,
    String subtitle,
    String description,
    HeroMedia media,
    ActionCta primaryCta,
    ActionCta secondaryCta
  ) {}

  public record HeroMedia(String image, String accentColor) {}

  public record ActionCta(String label, String link) {}

  public record FeatureCard(
    UUID id,
    String title,
    String subtitle,
    String description,
    String icon,
    ActionCta cta
  ) {}

  public record SpotlightCard(
    UUID id,
    String title,
    String description,
    String badge,
    String navigationSlug,
    String link
  ) {}

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
