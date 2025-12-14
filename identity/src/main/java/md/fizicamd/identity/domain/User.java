package md.fizicamd.identity.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User {
  @Id
  @Column(name = "id", nullable = false)
  private UUID id;

  @Column(name = "email", nullable = false, unique = true)
  private String email;

  @Column(name = "password_hash", nullable = false)
  private String passwordHash;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false)
  private UserStatus status;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  @Column(name = "last_login_at")
  private Instant lastLoginAt;

  @Column(name = "is_email_verified", nullable = false)
  private boolean emailVerified = false;

  @Column(name = "deleted_at")
  private Instant deletedAt;

  @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
  private Set<UserRole> roles = new HashSet<>();

  protected User() {}

  public User(UUID id, String email, String passwordHash, UserStatus status, Instant createdAt) {
    this.id = id;
    this.email = email.toLowerCase();
    this.passwordHash = passwordHash;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = createdAt;
  }

  public UUID getId() { return id; }
  public String getEmail() { return email; }
  public String getPasswordHash() { return passwordHash; }
  public UserStatus getStatus() { return status; }
  public Instant getCreatedAt() { return createdAt; }
  public Instant getUpdatedAt() { return updatedAt; }
  public Instant getLastLoginAt() { return lastLoginAt; }
  public void setLastLoginAt(Instant t) { this.lastLoginAt = t; }
  public boolean isEmailVerified() { return emailVerified; }
  public Instant getDeletedAt() { return deletedAt; }

  public Set<UserRole> getRoles() { return roles; }

  public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
  public void setStatus(UserStatus status) { this.status = status; }
  public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }
  public void setDeletedAt(Instant deletedAt) { this.deletedAt = deletedAt; }

  @PrePersist
  public void onCreate() {
    var now = Instant.now();
    if (createdAt == null) {
      createdAt = now;
    }
    updatedAt = createdAt;
  }

  @PreUpdate
  public void onUpdate() {
    updatedAt = Instant.now();
  }
}
