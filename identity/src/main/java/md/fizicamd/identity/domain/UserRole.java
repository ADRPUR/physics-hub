package md.fizicamd.identity.domain;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "user_roles",
  uniqueConstraints = @UniqueConstraint(name = "uq_user_role", columnNames = {"user_id","role_id"}))
public class UserRole {

  @Id
  @Column(name = "id", nullable = false)
  private UUID id;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "role_id", nullable = false)
  private Role role;

  @Column(name = "assigned_at", nullable = false)
  private java.time.Instant assignedAt;

  protected UserRole() {}

  public UserRole(UUID id, User user, Role role) {
    this.id = id;
    this.user = user;
    this.role = role;
    this.assignedAt = java.time.Instant.now();
  }

  public UUID getId() { return id; }
  public User getUser() { return user; }
  public Role getRole() { return role; }
  public java.time.Instant getAssignedAt() { return assignedAt; }

  @PrePersist
  void onCreate() {
    if (assignedAt == null) {
      assignedAt = java.time.Instant.now();
    }
  }
}
