package md.fizicamd.app.resources;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "resource_entries")
public class ResourceEntry {

  @Id
  @Column(name = "id", nullable = false)
  private UUID id;

  @Column(name = "category_code", nullable = false)
  private String categoryCode;

  @Column(name = "author_id", nullable = false)
  private UUID authorId;

  @Column(name = "title", nullable = false)
  private String title;

  @Column(name = "slug", nullable = false, unique = true)
  private String slug;

  @Column(name = "summary", nullable = false)
  private String summary;

  @Column(name = "avatar_media_id")
  private UUID avatarMediaId;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "content", columnDefinition = "jsonb")
  private String content;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "tags", columnDefinition = "jsonb")
  private String tags;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false)
  private ResourceStatus status;

  @Column(name = "published_at")
  private Instant publishedAt;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  protected ResourceEntry() {}

  public UUID getId() {
    return id;
  }

  public String getCategoryCode() {
    return categoryCode;
  }

  public UUID getAuthorId() {
    return authorId;
  }

  public String getTitle() {
    return title;
  }

  public String getSlug() {
    return slug;
  }

  public String getSummary() {
    return summary;
  }

  public UUID getAvatarMediaId() {
    return avatarMediaId;
  }

  public String getContent() {
    return content;
  }

  public String getTags() {
    return tags;
  }

  public ResourceStatus getStatus() {
    return status;
  }

  public Instant getPublishedAt() {
    return publishedAt;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public void setCategoryCode(String categoryCode) {
    this.categoryCode = categoryCode;
  }

  public void setAuthorId(UUID authorId) {
    this.authorId = authorId;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public void setSlug(String slug) {
    this.slug = slug;
  }

  public void setSummary(String summary) {
    this.summary = summary;
  }

  public void setAvatarMediaId(UUID avatarMediaId) {
    this.avatarMediaId = avatarMediaId;
  }

  public void setContent(String content) {
    this.content = content;
  }

  public void setTags(String tags) {
    this.tags = tags;
  }

  public void setStatus(ResourceStatus status) {
    this.status = status;
  }

  public void setPublishedAt(Instant publishedAt) {
    this.publishedAt = publishedAt;
  }

  @PrePersist
  void onCreate() {
    if (id == null) {
      id = UUID.randomUUID();
    }
    if (createdAt == null) {
      createdAt = Instant.now();
    }
    updatedAt = createdAt;
    if (content == null) {
      content = "[]";
    }
    if (tags == null) {
      tags = "[]";
    }
    if (status == null) {
      status = ResourceStatus.PUBLISHED;
    }
    if (publishedAt == null && status == ResourceStatus.PUBLISHED) {
      publishedAt = Instant.now();
    }
  }

  @PreUpdate
  void onUpdate() {
    updatedAt = Instant.now();
    if (content == null) {
      content = "[]";
    }
    if (tags == null) {
      tags = "[]";
    }
  }
}
