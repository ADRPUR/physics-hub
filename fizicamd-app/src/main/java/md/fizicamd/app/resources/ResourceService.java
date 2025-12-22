package md.fizicamd.app.resources;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import md.fizicamd.identity.application.UserProfileRepository;
import md.fizicamd.identity.application.UserRepository;
import md.fizicamd.identity.domain.Profile.UserProfile;
import md.fizicamd.shared.NotFoundException;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;

import java.text.Normalizer;
import java.time.Instant;
import java.util.*;

@Service
public class ResourceService {
  private static final TypeReference<List<String>> STRING_LIST = new TypeReference<>() {};
  private static final TypeReference<List<ResourceContentBlock>> BLOCK_LIST = new TypeReference<>() {};

  private final ResourceCategoryRepository categoryRepository;
  private final ResourceEntryRepository entryRepository;
  private final UserRepository userRepository;
  private final UserProfileRepository profileRepository;
  private final ObjectMapper objectMapper;

  public ResourceService(ResourceCategoryRepository categoryRepository,
                         ResourceEntryRepository entryRepository,
                         UserRepository userRepository,
                         UserProfileRepository profileRepository,
                         ObjectMapper objectMapper) {
    this.categoryRepository = categoryRepository;
    this.entryRepository = entryRepository;
    this.userRepository = userRepository;
    this.profileRepository = profileRepository;
    this.objectMapper = objectMapper;
  }

  public List<ResourceCategory> listCategories() {
    return categoryRepository.findAllByOrderByGroupOrderAscSortOrderAsc();
  }

  @Transactional
  public ResourceCategory createCategory(String label, String groupLabel, Integer sortOrder, Integer groupOrder) {
    var normalizedLabel = normalizeRequired(label, "Denumirea categoriei este obligatorie.");
    var normalizedGroup = normalizeRequired(groupLabel, "Denumirea grupului este obligatorie.");
    var category = new ResourceCategory();
    category.setLabel(normalizedLabel);
    category.setGroupLabel(normalizedGroup);
    category.setCode(resolveCategoryCode(normalizedLabel));
    category.setGroupOrder(resolveGroupOrder(normalizedGroup, groupOrder, null));
    category.setSortOrder(resolveSortOrder(normalizedGroup, sortOrder, null));
    return categoryRepository.save(category);
  }

  @Transactional
  public ResourceCategory updateCategory(String code, String label, String groupLabel, Integer sortOrder, Integer groupOrder) {
    var category = categoryRepository.findByCode(code).orElseThrow(() -> new NotFoundException("Categoria nu există."));
    var normalizedLabel = normalizeRequired(label, "Denumirea categoriei este obligatorie.");
    var normalizedGroup = normalizeRequired(groupLabel, "Denumirea grupului este obligatorie.");
    var movingGroup = !category.getGroupLabel().equals(normalizedGroup);
    var resolvedGroupOrder = resolveGroupOrder(normalizedGroup, groupOrder, movingGroup ? null : category.getGroupOrder());
    int resolvedSortOrder;
    if (sortOrder != null) {
      resolvedSortOrder = sortOrder;
    } else if (movingGroup) {
      resolvedSortOrder = resolveSortOrder(normalizedGroup, null, null);
    } else {
      resolvedSortOrder = category.getSortOrder();
    }
    category.setLabel(normalizedLabel);
    category.setGroupLabel(normalizedGroup);
    category.setGroupOrder(resolvedGroupOrder);
    category.setSortOrder(resolvedSortOrder);
    return categoryRepository.save(category);
  }

  @Transactional
  public void deleteCategory(String code) {
    var category = categoryRepository.findByCode(code).orElseThrow(() -> new NotFoundException("Categoria nu există."));
    if (entryRepository.existsByCategoryCode(code)) {
      throw new IllegalStateException("Nu poți șterge această categorie deoarece există resurse asociate.");
    }
    categoryRepository.delete(category);
  }

  @Transactional
  public List<ResourceCategory> updateGroup(String currentLabel, String newLabel, Integer groupOrder) {
    var normalizedCurrent = normalizeRequired(currentLabel, "Grupul selectat este invalid.");
    var normalizedNew = normalizeRequired(newLabel, "Denumirea grupului este obligatorie.");
    var categories = categoryRepository.findByGroupLabel(normalizedCurrent);
    if (categories.isEmpty()) {
      throw new NotFoundException("Grupul nu există.");
    }
    int resolvedOrder = groupOrder != null ? groupOrder : categories.get(0).getGroupOrder();
    for (var category : categories) {
      category.setGroupLabel(normalizedNew);
      category.setGroupOrder(resolvedOrder);
    }
    return categoryRepository.saveAll(categories);
  }

  public List<ResourceEntry> listPublished(String categoryCode, int limit) {
    List<ResourceEntry> items;
    if (categoryCode != null && !categoryCode.isBlank()) {
      items = entryRepository.findByCategoryCodeAndStatusOrderByPublishedAtDesc(categoryCode, ResourceStatus.PUBLISHED);
    } else {
      items = entryRepository.findByStatusOrderByPublishedAtDesc(ResourceStatus.PUBLISHED);
    }
    if (limit > 0 && items.size() > limit) {
      return items.subList(0, limit);
    }
    return items;
  }

  public Page<ResourceEntry> listPublishedPage(String categoryCode, int page, int size) {
    var pageable = PageRequest.of(page, size);
    if (categoryCode != null && !categoryCode.isBlank()) {
      return entryRepository.findByCategoryCodeAndStatusOrderByPublishedAtDesc(
        categoryCode,
        ResourceStatus.PUBLISHED,
        pageable
      );
    }
    return entryRepository.findByStatusOrderByPublishedAtDesc(ResourceStatus.PUBLISHED, pageable);
  }

  public List<ResourceEntry> searchPublished(String term, int limit) {
    var cleaned = Optional.ofNullable(term).map(String::trim).orElse("");
    if (cleaned.isBlank()) {
      return List.of();
    }
    var size = Math.max(1, Math.min(limit, 20));
    return entryRepository.searchByTerm(ResourceStatus.PUBLISHED, cleaned, PageRequest.of(0, size));
  }

  public Optional<ResourceCategory> findCategory(String code) {
    if (code == null) {
      return Optional.empty();
    }
    return categoryRepository.findByCode(code);
  }

  public List<ResourceEntry> listByAuthor(UUID authorId, boolean canManageOthers) {
    if (canManageOthers) {
      return entryRepository.findAllByOrderByCreatedAtDesc();
    }
    return entryRepository.findByAuthorIdOrderByCreatedAtDesc(authorId);
  }

  public ResourceEntry findPublishedBySlug(String slug) {
    var entry = entryRepository.findBySlug(slug)
      .orElseThrow(() -> new NotFoundException("Resursa nu există"));
    if (entry.getStatus() != ResourceStatus.PUBLISHED) {
      throw new NotFoundException("Resursa nu este publică");
    }
    return entry;
  }

  public ResourceEntry findById(UUID resourceId) {
    return entryRepository.findById(resourceId).orElseThrow(() -> new NotFoundException("Resursa nu există"));
  }

  @Transactional
  public ResourceEntry createResource(UUID authorId, ResourceCreateCommand cmd) {
    if (cmd == null) {
      throw new IllegalArgumentException("Datele resursei lipsesc");
    }
    var category = categoryRepository.findByCode(cmd.categoryCode())
      .orElseThrow(() -> new IllegalArgumentException("Categoria selectată nu există."));
    var title = Optional.ofNullable(cmd.title()).map(String::trim).orElse("");
    var summary = Optional.ofNullable(cmd.summary()).map(String::trim).orElse("");
    if (title.isBlank() || summary.isBlank()) {
      throw new IllegalArgumentException("Titlul și descrierea sunt obligatorii.");
    }

    var status = Optional.ofNullable(cmd.status()).orElse(ResourceStatus.PUBLISHED);
    var entry = new ResourceEntry();
    entry.setCategoryCode(category.getCode());
    entry.setAuthorId(authorId);
    entry.setTitle(title);
    entry.setSummary(summary);
    entry.setAvatarMediaId(cmd.avatarAssetId());
    entry.setTags(writeJson(cleanTags(cmd.tags())));
    entry.setContent(writeJson(validateBlocks(cmd.blocks())));
    entry.setStatus(status);
    entry.setPublishedAt(status == ResourceStatus.PUBLISHED ? Instant.now() : null);
    entry.setSlug(resolveSlug(title));

    return entryRepository.save(entry);
  }

  @Transactional
  public ResourceEntry updateResource(UUID resourceId, UUID actorId, boolean canManageOthers, ResourceCreateCommand cmd) {
    var entry = findById(resourceId);
    if (!canManageOthers && !entry.getAuthorId().equals(actorId)) {
      throw new NotFoundException("Resursa nu a fost găsită.");
    }
    var category = categoryRepository.findByCode(cmd.categoryCode())
      .orElseThrow(() -> new IllegalArgumentException("Categoria selectată nu există."));

    var title = Optional.ofNullable(cmd.title()).map(String::trim).orElse("");
    var summary = Optional.ofNullable(cmd.summary()).map(String::trim).orElse("");
    if (title.isBlank() || summary.isBlank()) {
      throw new IllegalArgumentException("Titlul și descrierea sunt obligatorii.");
    }

    var status = Optional.ofNullable(cmd.status()).orElse(entry.getStatus());
    entry.setCategoryCode(category.getCode());
    entry.setTitle(title);
    entry.setSummary(summary);
    entry.setAvatarMediaId(cmd.avatarAssetId());
    entry.setTags(writeJson(cleanTags(cmd.tags())));
    entry.setContent(writeJson(validateBlocks(cmd.blocks())));
    entry.setStatus(status);
    if (status == ResourceStatus.PUBLISHED) {
      if (entry.getPublishedAt() == null) {
        entry.setPublishedAt(Instant.now());
      }
    } else {
      entry.setPublishedAt(null);
    }
    return entryRepository.save(entry);
  }

  @Transactional
  public void deleteResource(UUID resourceId, UUID actorId, boolean canManageOthers) {
    var entry = findById(resourceId);
    if (!canManageOthers && !entry.getAuthorId().equals(actorId)) {
      throw new NotFoundException("Resursa nu a fost găsită.");
    }
    entryRepository.delete(entry);
  }

  public List<String> readTags(ResourceEntry entry) {
    var raw = Optional.ofNullable(entry.getTags()).orElse("[]");
    try {
      return objectMapper.readValue(raw, STRING_LIST);
    } catch (Exception e) {
      return List.of();
    }
  }

  public List<ResourceContentBlock> readBlocks(ResourceEntry entry) {
    var raw = Optional.ofNullable(entry.getContent()).orElse("[]");
    try {
      return objectMapper.readValue(raw, BLOCK_LIST);
    } catch (Exception e) {
      return List.of();
    }
  }

  public String authorDisplayName(UUID authorId) {
    UserProfile profile = profileRepository.findById(authorId).orElse(null);
    if (profile != null) {
      var first = profile.getFirstName();
      var last = profile.getLastName();
      if ((first != null && !first.isBlank()) || (last != null && !last.isBlank())) {
        return (Optional.ofNullable(first).orElse("") + " " + Optional.ofNullable(last).orElse("")).trim();
      }
    }
    return userRepository.findById(authorId)
      .map(u -> u.getEmail())
      .orElse("Profesor");
  }

  private List<String> cleanTags(List<String> tags) {
    if (tags == null) return List.of();
    return tags.stream()
      .map(tag -> tag == null ? "" : tag.trim())
      .filter(tag -> !tag.isBlank())
      .distinct()
      .limit(12)
      .toList();
  }

  private List<ResourceContentBlock> validateBlocks(List<ResourceContentBlock> blocks) {
    if (blocks == null) {
      return List.of();
    }
    var cleaned = new ArrayList<ResourceContentBlock>();
    for (var block : blocks) {
      if (block == null || block.type() == null) continue;
      switch (block.type()) {
        case TEXT -> {
          var text = Optional.ofNullable(block.text()).map(String::trim).orElse("");
          if (!text.isBlank()) {
            cleaned.add(new ResourceContentBlock(ResourceBlockType.TEXT, text, null, null, null, block.title()));
          }
        }
        case LINK -> {
          var url = Optional.ofNullable(block.url()).map(String::trim).orElse("");
          if (!url.isBlank()) {
            cleaned.add(new ResourceContentBlock(ResourceBlockType.LINK, null, url, null, null, Optional.ofNullable(block.title()).orElse("Link")));
          }
        }
        case IMAGE, PDF -> {
          if (block.assetId() == null) {
            throw new IllegalArgumentException("Încărcarea fișierului pentru blocurile media este obligatorie.");
          }
          var caption = Optional.ofNullable(block.caption()).map(String::trim).filter(s -> !s.isBlank()).orElse(null);
          var title = Optional.ofNullable(block.title()).map(String::trim).filter(s -> !s.isBlank()).orElse(null);
          cleaned.add(new ResourceContentBlock(block.type(), null, null, block.assetId(), caption, title));
        }
        case FORMULA -> {
          var expression = Optional.ofNullable(block.text()).map(String::trim).orElse("");
          if (expression.isBlank()) {
            throw new IllegalArgumentException("Formula nu poate fi goală.");
          }
          cleaned.add(new ResourceContentBlock(ResourceBlockType.FORMULA, expression, null, null, null, block.title()));
        }
      }
    }
    return cleaned;
  }

  private String resolveSlug(String fallbackTitle) {
    var base = Optional.ofNullable(fallbackTitle).map(String::trim).orElse("");
    if (base == null || base.isBlank()) {
      base = UUID.randomUUID().toString();
    }
    var normalized = slugify(base);
    var candidate = normalized;
    int counter = 2;
    while (entryRepository.existsBySlug(candidate)) {
      candidate = normalized + "-" + counter;
      counter++;
    }
    return candidate;
  }

  private String resolveCategoryCode(String label) {
    var normalized = slugify(label);
    var candidate = normalized;
    int counter = 2;
    while (categoryRepository.existsByCode(candidate)) {
      candidate = normalized + "-" + counter;
      counter++;
    }
    return candidate;
  }

  private int resolveGroupOrder(String groupLabel, Integer requested, Integer fallback) {
    if (requested != null) {
      return requested;
    }
    if (fallback != null) {
      return fallback;
    }
    var existing = categoryRepository.findByGroupLabel(groupLabel);
    if (!existing.isEmpty()) {
      return existing.get(0).getGroupOrder();
    }
    var max = Optional.ofNullable(categoryRepository.findMaxGroupOrder()).orElse(0);
    return max + 1;
  }

  private int resolveSortOrder(String groupLabel, Integer requested, Integer fallback) {
    if (requested != null) {
      return requested;
    }
    if (fallback != null) {
      return fallback;
    }
    var max = categoryRepository.findMaxSortOrderInGroup(groupLabel);
    return (max == null ? 0 : max) + 1;
  }

  private String slugify(String raw) {
    var normalized = Normalizer.normalize(raw, Normalizer.Form.NFD)
      .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
      .toLowerCase(Locale.ROOT)
      .replaceAll("[^a-z0-9]+", "-")
      .replaceAll("(^-|-$)", "");
    if (normalized.isBlank()) {
      return UUID.randomUUID().toString();
    }
    return normalized;
  }

  private String normalizeRequired(String value, String message) {
    var trimmed = Optional.ofNullable(value).map(String::trim).orElse("");
    if (trimmed.isBlank()) {
      throw new IllegalArgumentException(message);
    }
    return trimmed;
  }

  private <T> String writeJson(T value) {
    try {
      return objectMapper.writeValueAsString(value == null ? List.of() : value);
    } catch (Exception e) {
      throw new RuntimeException("Nu am putut serializa conținutul resursei", e);
    }
  }
}
