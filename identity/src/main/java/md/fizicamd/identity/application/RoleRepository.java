package md.fizicamd.identity.application;

import md.fizicamd.identity.domain.Role;
import md.fizicamd.identity.domain.RoleCode;

import java.util.Optional;

public interface RoleRepository {
    Optional<Role> findByCode(RoleCode code);
}
