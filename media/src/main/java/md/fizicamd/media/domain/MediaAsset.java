package md.fizicamd.media.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "media_assets")
public class MediaAsset {
  @Id
  @Column(name = "id", nullable = false)
  private UUID id;

  @Column(name = "owner_user_id")
  private UUID ownerUserId;

  @Column(name = "bucket", nullable = false)
  private String bucket;

  @Column(name = "storage_key", nullable = false)
  private String storageKey;

  @Enumerated(EnumType.STRING)
  @Column(name = "type", nullable = false)
  private MediaType type;

  @Column(name = "filename")
  private String filename;

  @Column(name = "description")
  private String description;

  @Column(name = "content_type", nullable = false)
  private String contentType;

  @Column(name = "size_bytes", nullable = false)
  private long sizeBytes;

  @Column(name = "sha256")
  private String sha256;

  @Column(name = "access_policy", nullable = false)
  private String accessPolicy = "PRIVATE";

  @Column(name = "status", nullable = false)
  private String status = "READY";

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "metadata", columnDefinition = "jsonb")
  private String metadata;

  @Column(name = "expires_at")
  private Instant expiresAt;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  protected MediaAsset() {}

  public MediaAsset(UUID id, UUID ownerUserId, MediaType type, String contentType, long sizeBytes, String bucket, String storageKey, Instant createdAt) {
    this.id = id;
    this.ownerUserId = ownerUserId;
    this.type = type;
    this.contentType = contentType;
    this.sizeBytes = sizeBytes;
    this.bucket = bucket;
    this.storageKey = storageKey;
    this.metadata = "{}";
    this.createdAt = createdAt;
    this.updatedAt = createdAt;
  }

  public UUID getId() { return id; }
  public UUID getOwnerUserId() { return ownerUserId; }
  public String getBucket() { return bucket; }
  public String getStorageKey() { return storageKey; }
  public MediaType getType() { return type; }
  public String getFilename() { return filename; }
  public String getDescription() { return description; }
  public String getContentType() { return contentType; }
  public long getSizeBytes() { return sizeBytes; }
  public String getSha256() { return sha256; }
  public Instant getCreatedAt() { return createdAt; }
  public Instant getUpdatedAt() { return updatedAt; }
  public String getAccessPolicy() { return accessPolicy; }
  public String getStatus() { return status; }
  public String getMetadata() { return metadata; }
  public Instant getExpiresAt() { return expiresAt; }

  public void setFilename(String filename) { this.filename = filename; }
  public void setDescription(String description) { this.description = description; }
  public void setSha256(String sha256) { this.sha256 = sha256; }
  public void setAccessPolicy(String accessPolicy) { this.accessPolicy = accessPolicy; }
  public void setStatus(String status) { this.status = status; }
  public void setMetadata(String metadata) { this.metadata = metadata; }
  public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }

  @PrePersist
  void onCreate() {
    if (createdAt == null) {
      createdAt = Instant.now();
    }
    if (metadata == null) {
      metadata = "{}";
    }
    updatedAt = createdAt;
  }

  @PreUpdate
  void onUpdate() {
    updatedAt = Instant.now();
  }
}
