package md.fizicamd.app.api.publicsite;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import md.fizicamd.app.api.publicsite.HomepageDtos.*;
import md.fizicamd.app.content.JpaHomepageBlockRepository;
import md.fizicamd.app.navigation.JpaNavigationRepository;
import md.fizicamd.content.homepage.HomepageBlock;
import md.fizicamd.navigation.domain.Visibility;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class PublicContentService {
  private final JpaHomepageBlockRepository homepageRepository;
  private final JpaNavigationRepository navigationRepository;
  private final ObjectMapper objectMapper;

  public PublicContentService(JpaHomepageBlockRepository homepageRepository,
                              JpaNavigationRepository navigationRepository,
                              ObjectMapper objectMapper) {
    this.homepageRepository = homepageRepository;
    this.navigationRepository = navigationRepository;
    this.objectMapper = objectMapper;
  }

  public HomepageResponse fetchHomepage() {
    var blocks = homepageRepository.findAllByOrderBySortOrderAsc();

    var hero = blocks.stream()
      .filter(b -> "HERO".equalsIgnoreCase(b.getBlockType()))
      .findFirst()
      .map(this::mapHero)
      .orElse(null);

    var features = blocks.stream()
      .filter(b -> "FEATURE".equalsIgnoreCase(b.getBlockType()))
      .sorted(Comparator.comparingInt(HomepageBlock::getSortOrder))
      .map(this::mapFeature)
      .toList();

    var spotlights = blocks.stream()
      .filter(b -> "SPOTLIGHT".equalsIgnoreCase(b.getBlockType()))
      .sorted(Comparator.comparingInt(HomepageBlock::getSortOrder))
      .map(this::mapSpotlight)
      .toList();

    return new HomepageResponse(hero, features, spotlights);
  }

  public List<SearchResultItem> searchNavigation(String rawQuery) {
    var term = Optional.ofNullable(rawQuery).map(String::trim).orElse("");
    if (term.isBlank()) {
      return List.of();
    }
    var results = navigationRepository.searchPublic(
      Visibility.PUBLIC,
      term,
      PageRequest.of(0, 20)
    );

    return results.stream()
      .map(item -> new SearchResultItem(
        item.getId(),
        item.getTitle(),
        item.getSlug(),
        item.getHref(),
        item.getType().name(),
        item.getParentId()
      ))
      .toList();
  }

  private HeroBlock mapHero(HomepageBlock block) {
    var mediaNode = readJson(block.getMedia());
    var metadata = readJson(block.getMetadata());
    var secondaryNode = metadata.path("secondaryCta");
    return new HeroBlock(
      block.getTitle(),
      block.getSubtitle(),
      block.getDescription(),
      new HeroMedia(
        textOrNull(mediaNode, "image"),
        textOrNull(mediaNode, "accent")
      ),
      new ActionCta(block.getCtaLabel(), block.getCtaLink()),
      secondaryNode.isMissingNode() || secondaryNode.isNull()
        ? null
        : new ActionCta(
          textOrNull(secondaryNode, "label"),
          textOrNull(secondaryNode, "link")
        )
    );
  }

  private FeatureCard mapFeature(HomepageBlock block) {
    var metadata = readJson(block.getMetadata());
    return new FeatureCard(
      block.getId(),
      block.getTitle(),
      block.getSubtitle(),
      block.getDescription(),
      textOrNull(metadata, "icon"),
      new ActionCta(block.getCtaLabel(), block.getCtaLink())
    );
  }

  private SpotlightCard mapSpotlight(HomepageBlock block) {
    var metadata = readJson(block.getMetadata());
    return new SpotlightCard(
      block.getId(),
      block.getTitle(),
      block.getDescription(),
      textOrNull(metadata, "badge"),
      textOrNull(metadata, "navigationSlug"),
      block.getCtaLink()
    );
  }

  private JsonNode readJson(String json) {
    if (json == null || json.isBlank()) {
      return objectMapper.createObjectNode();
    }
    try {
      return objectMapper.readTree(json);
    } catch (IOException e) {
      return objectMapper.createObjectNode();
    }
  }

  private String textOrNull(JsonNode node, String field) {
    JsonNode child;
    if (node == null) {
      return null;
    }
    if (node instanceof ObjectNode objectNode) {
      child = objectNode.path(field);
    } else {
      child = node.path(field);
    }
    return child.isMissingNode() || child.isNull() ? null : child.asText();
  }
}
