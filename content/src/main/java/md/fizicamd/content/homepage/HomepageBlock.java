package md.fizicamd.content.homepage;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "homepage_blocks")
public class HomepageBlock {

  @Id
  @Column(name = "id", nullable = false)
  private UUID id;

  @Column(name = "block_type", nullable = false)
  private String blockType;

  @Column(name = "title", nullable = false)
  private String title;

  @Column(name = "subtitle")
  private String subtitle;

  @Column(name = "description")
  private String description;

  @Column(name = "cta_label")
  private String ctaLabel;

  @Column(name = "cta_link")
  private String ctaLink;

  @Column(name = "media", columnDefinition = "jsonb")
  private String media;

  @Column(name = "metadata", columnDefinition = "jsonb")
  private String metadata;

  @Column(name = "sort_order", nullable = false)
  private int sortOrder;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  protected HomepageBlock() {}

  public HomepageBlock(UUID id, String blockType, String title, String subtitle,
                       String description, String ctaLabel, String ctaLink,
                       String media, String metadata, int sortOrder) {
    this.id = id;
    this.blockType = blockType;
    this.title = title;
    this.subtitle = subtitle;
    this.description = description;
    this.ctaLabel = ctaLabel;
    this.ctaLink = ctaLink;
    this.media = media != null ? media : "{}";
    this.metadata = metadata != null ? metadata : "{}";
    this.sortOrder = sortOrder;
  }

  public UUID getId() { return id; }
  public String getBlockType() { return blockType; }
  public String getTitle() { return title; }
  public String getSubtitle() { return subtitle; }
  public String getDescription() { return description; }
  public String getCtaLabel() { return ctaLabel; }
  public String getCtaLink() { return ctaLink; }
  public String getMedia() { return media; }
  public String getMetadata() { return metadata; }
  public int getSortOrder() { return sortOrder; }
  public Instant getCreatedAt() { return createdAt; }
  public Instant getUpdatedAt() { return updatedAt; }

  public void setId(UUID id) { this.id = id; }
  public void setBlockType(String blockType) { this.blockType = blockType; }
  public void setTitle(String title) { this.title = title; }
  public void setSubtitle(String subtitle) { this.subtitle = subtitle; }
  public void setDescription(String description) { this.description = description; }
  public void setCtaLabel(String ctaLabel) { this.ctaLabel = ctaLabel; }
  public void setCtaLink(String ctaLink) { this.ctaLink = ctaLink; }
  public void setMedia(String media) { this.media = media; }
  public void setMetadata(String metadata) { this.metadata = metadata; }
  public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }

  @PrePersist
  void onCreate() {
    var now = Instant.now();
    createdAt = now;
    updatedAt = now;
    if (media == null) media = "{}";
    if (metadata == null) metadata = "{}";
  }

  @PreUpdate
  void onUpdate() {
    updatedAt = Instant.now();
    if (media == null) media = "{}";
    if (metadata == null) metadata = "{}";
  }
}
