package md.fizicamd.shared;

import java.time.Instant;

/** Marker interface for domain events (can be used later with Outbox pattern). */
public interface DomainEvent {
  Instant occurredAt();
}
