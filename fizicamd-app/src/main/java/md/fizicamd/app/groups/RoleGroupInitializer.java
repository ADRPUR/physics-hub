package md.fizicamd.app.groups;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Ensures that per-role groups exist on startup so new RoleCode values
 * automatically get a backing group row.
 */
@Component
public class RoleGroupInitializer implements ApplicationRunner {
    private final RoleGroupService roleGroupService;

    public RoleGroupInitializer(RoleGroupService roleGroupService) {
        this.roleGroupService = roleGroupService;
    }

    @Override
    public void run(ApplicationArguments args) {
        roleGroupService.ensureAllRoleGroupsExist();
    }
}
