package md.fizicamd.navigation.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "navigation_items")
public class NavigationItem {

  @Id
  @Column(name = "id", nullable = false)
  private UUID id;

  @Column(name = "parent_id")
  private UUID parentId;

  @Column(name = "title", nullable = false)
  private String title;

  @Column(name = "slug", nullable = false)
  private String slug;

  @Enumerated(EnumType.STRING)
  @Column(name = "type", nullable = false)
  private NavItemType type;

  @Column(name = "href")
  private String href;

  @Enumerated(EnumType.STRING)
  @Column(name = "visibility", nullable = false)
  private Visibility visibility;

  @Column(name = "sort_order", nullable = false)
  private int sortOrder;

  @Column(name = "icon")
  private String icon;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  protected NavigationItem() {}

  public NavigationItem(UUID id, UUID parentId, String title, String slug, NavItemType type, String href,
                        Visibility visibility, int sortOrder, String icon, Instant createdAt) {
    this.id = id;
    this.parentId = parentId;
    this.title = title;
    this.slug = slug;
    this.type = type;
    this.href = href;
    this.visibility = visibility;
    this.sortOrder = sortOrder;
    this.icon = icon;
    this.createdAt = createdAt;
  }

  public UUID getId() { return id; }
  public UUID getParentId() { return parentId; }
  public String getTitle() { return title; }
  public String getSlug() { return slug; }
  public NavItemType getType() { return type; }
  public String getHref() { return href; }
  public Visibility getVisibility() { return visibility; }
  public int getSortOrder() { return sortOrder; }
  public String getIcon() { return icon; }
  public Instant getCreatedAt() { return createdAt; }
  public Instant getUpdatedAt() { return updatedAt; }

  public void setId(UUID id) { this.id = id; }
  public void setParentId(UUID parentId) { this.parentId = parentId; }
  public void setTitle(String title) { this.title = title; }
  public void setSlug(String slug) { this.slug = slug; }
  public void setType(NavItemType type) { this.type = type; }
  public void setHref(String href) { this.href = href; }
  public void setVisibility(Visibility visibility) { this.visibility = visibility; }
  public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }
  public void setIcon(String icon) { this.icon = icon; }
  public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
  public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

  @PrePersist
  void onCreate() {
    var now = Instant.now();
    createdAt = now;
    updatedAt = now;
  }

  @PreUpdate
  void onUpdate() {
    updatedAt = Instant.now();
  }
}
