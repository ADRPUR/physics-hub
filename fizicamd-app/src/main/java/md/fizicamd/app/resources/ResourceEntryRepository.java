package md.fizicamd.app.resources;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ResourceEntryRepository extends JpaRepository<ResourceEntry, UUID> {
  Optional<ResourceEntry> findBySlug(String slug);
  List<ResourceEntry> findByStatusOrderByPublishedAtDesc(ResourceStatus status);
  List<ResourceEntry> findByCategoryCodeAndStatusOrderByPublishedAtDesc(String categoryCode, ResourceStatus status);
  Page<ResourceEntry> findByStatusOrderByPublishedAtDesc(ResourceStatus status, Pageable pageable);
  Page<ResourceEntry> findByCategoryCodeAndStatusOrderByPublishedAtDesc(String categoryCode, ResourceStatus status, Pageable pageable);
  List<ResourceEntry> findByAuthorIdOrderByCreatedAtDesc(UUID authorId);
  List<ResourceEntry> findAllByOrderByCreatedAtDesc();
  boolean existsBySlug(String slug);
  boolean existsByCategoryCode(String categoryCode);
  @Query("""
    SELECT r FROM ResourceEntry r
    WHERE r.status = :status AND (
      LOWER(r.title) LIKE LOWER(CONCAT('%', :term, '%'))
      OR LOWER(r.summary) LIKE LOWER(CONCAT('%', :term, '%'))
      OR LOWER(COALESCE(CAST(r.tags AS string), '')) LIKE LOWER(CONCAT('%', :term, '%'))
    )
    ORDER BY r.publishedAt DESC
  """)
  List<ResourceEntry> searchByTerm(
    @Param("status") ResourceStatus status,
    @Param("term") String term,
    Pageable pageable
  );
}
