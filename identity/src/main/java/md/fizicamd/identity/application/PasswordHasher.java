package md.fizicamd.identity.application;

public interface PasswordHasher {
  String hash(String raw);
  boolean matches(String raw, String hash);
}
