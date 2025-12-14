package md.fizicamd.app.identity;

import md.fizicamd.identity.application.RoleRepository;
import md.fizicamd.identity.domain.Role;
import md.fizicamd.identity.domain.RoleCode;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class RoleRepositoryAdapter implements RoleRepository {

    private final JpaRoleRepository repo;

    public RoleRepositoryAdapter(JpaRoleRepository repo) {
        this.repo = repo;
    }

    @Override
    public Optional<Role> findByCode(RoleCode code) {
        return repo.findByCode(code);
    }
}
