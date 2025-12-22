package md.fizicamd.app.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.UUID;

public class JwtService {
  private final SecretKey key;
  private final String issuer;

  public JwtService(byte[] secret, String issuer) {
    this.key = Keys.hmacShaKeyFor(secret);
    this.issuer = issuer;
  }

  public String createAccessToken(UUID userId, String email, List<String> roles, long ttlSeconds) {
    var now = Instant.now();
    return Jwts.builder()
      .issuer(issuer)
      .subject(userId.toString())
      .claim("typ", "access")
      .claim("email", email)
      .claim("roles", roles)
      .issuedAt(Date.from(now))
      .expiration(Date.from(now.plusSeconds(ttlSeconds)))
      .signWith(key)
      .compact();
  }

  public String createRefreshToken(UUID userId, long ttlSeconds) {
    var now = Instant.now();
    return Jwts.builder()
      .issuer(issuer)
      .subject(userId.toString())
      .issuedAt(Date.from(now))
      .expiration(Date.from(now.plusSeconds(ttlSeconds)))
      .claim("typ", "refresh")
      .signWith(key)
      .compact();
  }

  public io.jsonwebtoken.Claims parse(String jwt) {
    return Jwts.parser()
      .verifyWith(key)
      .requireIssuer(issuer)
      .build()
      .parseSignedClaims(jwt)
      .getPayload();
  }
}
