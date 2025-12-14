package md.fizicamd.shared;

import java.util.Objects;
import java.util.Optional;

public final class Result<T> {
  private final T value;
  private final String error;

  private Result(T value, String error) {
    this.value = value;
    this.error = error;
  }

  public static <T> Result<T> ok(T value) { return new Result<>(value, null); }
  public static <T> Result<T> fail(String error) { return new Result<>(null, Objects.requireNonNull(error)); }

  public boolean isOk() { return error == null; }
  public Optional<T> value() { return Optional.ofNullable(value); }
  public Optional<String> error() { return Optional.ofNullable(error); }
}
