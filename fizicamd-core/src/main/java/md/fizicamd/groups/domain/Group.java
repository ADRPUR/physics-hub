package md.fizicamd.groups.domain;

import jakarta.persistence.*;
import md.fizicamd.identity.domain.User;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "groups")
public class Group {

    @Id
    private UUID id;

    @Column(nullable = false, length = 120)
    private String name;

    private Integer grade;

    private Integer year;

    @Column(length = 512)
    private String description;

    @Column(name = "visibility", nullable = false, length = 50)
    private String visibility = "PRIVATE";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id")
    private User teacher;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<GroupMember> members = new HashSet<>();

    protected Group() {}

    public Group(UUID id, String name, Integer grade, Integer year, Instant createdAt) {
        this.id = id;
        this.name = name;
        this.grade = grade;
        this.year = year;
        this.createdAt = createdAt;
        this.updatedAt = createdAt;
    }

    public UUID getId() { return id; }
    public String getName() { return name; }
    public Integer getGrade() { return grade; }
    public Integer getYear() { return year; }
    public String getDescription() { return description; }
    public String getVisibility() { return visibility; }
    public User getTeacher() { return teacher; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public Instant getDeletedAt() { return deletedAt; }
    public Set<GroupMember> getMembers() { return members; }

    public void setName(String name) { this.name = name; }
    public void setGrade(Integer grade) { this.grade = grade; }
    public void setYear(Integer year) { this.year = year; }
    public void setDescription(String description) { this.description = description; }
    public void setVisibility(String visibility) { this.visibility = visibility; }
    public void setTeacher(User teacher) { this.teacher = teacher; }
    public void setDeletedAt(Instant deletedAt) { this.deletedAt = deletedAt; }

    @PrePersist
    void onCreate() {
        var now = Instant.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
