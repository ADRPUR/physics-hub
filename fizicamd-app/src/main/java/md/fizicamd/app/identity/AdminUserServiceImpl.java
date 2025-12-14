package md.fizicamd.app.identity;

import md.fizicamd.app.groups.RoleGroupService;
import md.fizicamd.identity.application.AdminUserService;
import md.fizicamd.identity.domain.RoleCode;
import md.fizicamd.identity.domain.UserRole;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AdminUserServiceImpl implements AdminUserService {

    private final JpaUserRepository users;
    private final JpaRoleRepository roles;
    private final RoleGroupService roleGroupService;

    public AdminUserServiceImpl(JpaUserRepository users, JpaRoleRepository roles, RoleGroupService roleGroupService) {
        this.users = users;
        this.roles = roles;
        this.roleGroupService = roleGroupService;
    }

    @Override
    @Transactional
    public void assignRole(UUID userId, String role) {
        var code = RoleCode.valueOf(role.toUpperCase());
        var user = users.findWithRolesById(userId).orElseThrow();
        var roleEntity = roles.findByCode(code).orElseThrow();

        boolean exists = user.getRoles().stream().anyMatch(ur -> ur.getRole().getCode() == code);
        if (!exists) {
            user.getRoles().add(new UserRole(UUID.randomUUID(), user, roleEntity));
            users.save(user);
            roleGroupService.ensureMembership(user, code);
        }
    }

    @Override
    @Transactional
    public void removeRole(UUID userId, String role) {
        var code = RoleCode.valueOf(role.toUpperCase());
        var user = users.findWithRolesById(userId).orElseThrow();

        user.getRoles().removeIf(ur -> ur.getRole().getCode() == code);
        users.save(user);
    }
}
