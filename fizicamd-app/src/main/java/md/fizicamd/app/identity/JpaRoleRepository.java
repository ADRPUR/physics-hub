// fizicamd-app/src/main/java/md/fizicamd/app/identity/JpaRoleRepository.java
package md.fizicamd.app.identity;

import md.fizicamd.identity.domain.Role;
import md.fizicamd.identity.domain.RoleCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface JpaRoleRepository extends JpaRepository<Role, UUID> {
    Optional<Role> findByCode(RoleCode code);
}
