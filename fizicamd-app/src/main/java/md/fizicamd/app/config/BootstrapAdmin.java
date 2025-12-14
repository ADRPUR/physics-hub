package md.fizicamd.app.config;

import md.fizicamd.app.identity.JpaRoleRepository;
import md.fizicamd.app.identity.JpaUserRepository;
import md.fizicamd.identity.domain.RoleCode;
import md.fizicamd.identity.domain.UserRole;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.UUID;

@Configuration
public class BootstrapAdmin {

    @Bean
    CommandLineRunner seedAdmin(
            JpaUserRepository users,
            JpaRoleRepository roles,
            PlatformTransactionManager txManager
    ) {
        var tx = new TransactionTemplate(txManager);

        return args -> tx.execute(status -> {
            var adminEmail = "apurice@gmail.com";

            var userOpt = users.findWithRolesByEmail(adminEmail);
            var roleOpt = roles.findByCode(RoleCode.ADMIN);

            if (userOpt.isEmpty() || roleOpt.isEmpty()) {
                return null;
            }

            var user = userOpt.get();
            var role = roleOpt.get();

            // inside TX -> Hibernate session available
            boolean already = user.getRoles().stream()
                    .anyMatch(ur -> ur.getRole().getCode() == RoleCode.ADMIN);

            if (!already) {
                user.getRoles().add(new UserRole(UUID.randomUUID(), user, role));
                users.save(user);
            }

            return null;
        });
    }
}
