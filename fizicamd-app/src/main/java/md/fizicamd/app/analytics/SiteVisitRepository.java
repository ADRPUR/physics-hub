package md.fizicamd.app.analytics;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SiteVisitRepository extends JpaRepository<SiteVisit, UUID> {}
