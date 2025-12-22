package md.fizicamd.identity.domain.Profile;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "user_profiles")
public class UserProfile {
  @Id
  @Column(name = "user_id", nullable = false)
  private UUID userId;

  @Column(name = "first_name")
  private String firstName;

  @Column(name = "last_name")
  private String lastName;

  @Column(name = "birth_date")
  private LocalDate birthDate;

  @Column(name = "gender")
  private String gender;

  @Column(name = "phone")
  private String phone;

  @Column(name = "school")
  private String school;

  @Column(name = "grade_level")
  private String gradeLevel;

  @Column(name = "bio")
  private String bio;

  @Column(name = "avatar_media_id")
  private UUID avatarMediaId;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "contact_json", columnDefinition = "jsonb")
  private String contactJson;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "metadata", columnDefinition = "jsonb")
  private String metadata;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  protected UserProfile() {}

  public UserProfile(UUID userId) {
    this.userId = userId;
    this.contactJson = "{}";
    this.metadata = "{}";
  }

  public UUID getUserId() { return userId; }
  public String getFirstName() { return firstName; }
  public String getLastName() { return lastName; }
  public LocalDate getBirthDate() { return birthDate; }
  public String getGender() { return gender; }
  public String getPhone() { return phone; }
  public String getSchool() { return school; }
  public String getGradeLevel() { return gradeLevel; }
  public String getBio() { return bio; }
  public UUID getAvatarMediaId() { return avatarMediaId; }
  public String getContactJson() { return contactJson; }
  public String getMetadata() { return metadata; }
  public Instant getCreatedAt() { return createdAt; }
  public Instant getUpdatedAt() { return updatedAt; }

  public void setFirstName(String firstName) { this.firstName = firstName; }
  public void setLastName(String lastName) { this.lastName = lastName; }
  public void setBirthDate(LocalDate birthDate) { this.birthDate = birthDate; }
  public void setGender(String gender) { this.gender = gender; }
  public void setPhone(String phone) { this.phone = phone; }
  public void setSchool(String school) { this.school = school; }
  public void setGradeLevel(String gradeLevel) { this.gradeLevel = gradeLevel; }
  public void setBio(String bio) { this.bio = bio; }
  public void setAvatarMediaId(UUID avatarMediaId) { this.avatarMediaId = avatarMediaId; }
  public void setContactJson(String contactJson) { this.contactJson = contactJson; }
  public void setMetadata(String metadata) { this.metadata = metadata; }

  @PrePersist
  public void onCreate() {
    var now = Instant.now();
    if (contactJson == null) {
      contactJson = "{}";
    }
    if (metadata == null) {
      metadata = "{}";
    }
    createdAt = now;
    updatedAt = now;
  }

  @PreUpdate
  public void onUpdate() {
    updatedAt = Instant.now();
  }
}
