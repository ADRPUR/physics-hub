package md.fizicamd.app.resources;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "resource_categories")
public class ResourceCategory {

  @Id
  @Column(name = "id", nullable = false)
  private UUID id;

  @Column(name = "code", nullable = false, unique = true)
  private String code;

  @Column(name = "label", nullable = false)
  private String label;

  @Column(name = "group_label", nullable = false)
  private String groupLabel;

  @Column(name = "sort_order", nullable = false)
  private int sortOrder;

  @Column(name = "group_order", nullable = false)
  private int groupOrder;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  protected ResourceCategory() {}

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public String getCode() {
    return code;
  }

  public void setCode(String code) {
    this.code = code;
  }

  public String getLabel() {
    return label;
  }

  public void setLabel(String label) {
    this.label = label;
  }

  public String getGroupLabel() {
    return groupLabel;
  }

  public void setGroupLabel(String groupLabel) {
    this.groupLabel = groupLabel;
  }

  public int getSortOrder() {
    return sortOrder;
  }

  public void setSortOrder(int sortOrder) {
    this.sortOrder = sortOrder;
  }

  public int getGroupOrder() {
    return groupOrder;
  }

  public void setGroupOrder(int groupOrder) {
    this.groupOrder = groupOrder;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  @PrePersist
  void onCreate() {
    if (id == null) {
      id = UUID.randomUUID();
    }
    if (createdAt == null) {
      createdAt = Instant.now();
    }
  }
}
