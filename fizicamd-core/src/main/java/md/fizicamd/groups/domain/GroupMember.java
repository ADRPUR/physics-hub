package md.fizicamd.groups.domain;

import jakarta.persistence.*;
import md.fizicamd.identity.domain.User;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "group_members",
        uniqueConstraints = @UniqueConstraint(name = "uk_group_members_group_user", columnNames = {"group_id", "user_id"})
)
public class GroupMember {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "member_role", nullable = false, length = 20)
    private GroupMemberRole memberRole;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "ACTIVE";

    @Column(name = "joined_at", nullable = false)
    private Instant joinedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected GroupMember() {}

    public GroupMember(UUID id, Group group, User user, GroupMemberRole memberRole) {
        this.id = id;
        this.group = group;
        this.user = user;
        this.memberRole = memberRole;
        var now = Instant.now();
        this.joinedAt = now;
        this.createdAt = now;
        this.updatedAt = now;
        this.status = "ACTIVE";
    }

    public UUID getId() { return id; }
    public Group getGroup() { return group; }
    public User getUser() { return user; }
    public GroupMemberRole getMemberRole() { return memberRole; }
    public String getStatus() { return status; }
    public Instant getJoinedAt() { return joinedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public void setMemberRole(GroupMemberRole memberRole) { this.memberRole = memberRole; }
    public void setStatus(String status) { this.status = status; }

    @PrePersist
    void onCreate() {
        if (joinedAt == null) {
            joinedAt = Instant.now();
        }
        if (createdAt == null) {
            createdAt = joinedAt;
        }
        if (status == null) {
            status = "ACTIVE";
        }
        updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
