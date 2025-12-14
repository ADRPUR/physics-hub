package md.fizicamd.app.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.nio.charset.StandardCharsets;

@Configuration
public class JwtConfig {

  @Bean
  public JwtService jwtService(
    @Value("${security.jwt.secret}") String secret,
    @Value("${security.jwt.issuer}") String issuer
  ) {
    return new JwtService(secret.getBytes(StandardCharsets.UTF_8), issuer);
  }
}
