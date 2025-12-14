package md.fizicamd.identity.application;

import java.util.UUID;

public interface AdminUserService {
    void assignRole(UUID userId, String role);
    void removeRole(UUID userId, String role);
}
