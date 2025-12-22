package md.fizicamd.app.analytics;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "site_visits")
public class SiteVisit {
  @Id
  @Column(name = "id", nullable = false)
  private UUID id;

  @Column(name = "ip_address")
  private String ipAddress;

  @Column(name = "user_agent")
  private String userAgent;

  @Column(name = "path")
  private String path;

  @Column(name = "referrer")
  private String referrer;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  protected SiteVisit() {}

  public SiteVisit(String ipAddress, String userAgent, String path, String referrer) {
    this.ipAddress = ipAddress;
    this.userAgent = userAgent;
    this.path = path;
    this.referrer = referrer;
  }

  public UUID getId() { return id; }
  public String getIpAddress() { return ipAddress; }
  public String getUserAgent() { return userAgent; }
  public String getPath() { return path; }
  public String getReferrer() { return referrer; }
  public Instant getCreatedAt() { return createdAt; }

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
