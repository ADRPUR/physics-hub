package md.fizicamd.app.config;

import md.fizicamd.identity.application.IdentityService;
import md.fizicamd.identity.application.PasswordHasher;
import md.fizicamd.identity.application.RoleRepository;
import md.fizicamd.identity.application.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;

@Configuration
public class BeansConfig {

  @Bean
  public PasswordHasher passwordHasher() {
    var enc = Argon2PasswordEncoder.defaultsForSpringSecurity_v5_8();
    return new PasswordHasher() {
      @Override public String hash(String raw) { return enc.encode(raw); }
      @Override public boolean matches(String raw, String hash) { return enc.matches(raw, hash); }
    };
  }

  @Bean
  public IdentityService identityService(
          UserRepository userRepository,
          PasswordHasher hasher,
          RoleRepository roleRepository
  ) {
    return new IdentityService(userRepository, hasher, roleRepository);
  }
}
