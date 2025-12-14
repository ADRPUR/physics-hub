package md.fizicamd.identity.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "roles")
public class Role {
  @Id
  @Column(name = "id", nullable = false)
  private UUID id;

  @Enumerated(EnumType.STRING)
  @Column(name = "code", nullable = false, unique = true)
  private RoleCode code;

  @Column(name = "description")
  private String description;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  protected Role() {}

  public Role(UUID id, RoleCode code) {
    this.id = id;
    this.code = code;
  }

  public UUID getId() { return id; }
  public RoleCode getCode() { return code; }
  public String getDescription() { return description; }
  public Instant getCreatedAt() { return createdAt; }

  public void setDescription(String description) { this.description = description; }

  @PrePersist
  public void onCreate() {
    if (createdAt == null) {
      createdAt = Instant.now();
    }
  }
}
