package md.fizicamd.app.navigation;

import md.fizicamd.navigation.domain.NavigationItem;
import md.fizicamd.navigation.domain.Visibility;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface JpaNavigationRepository extends JpaRepository<NavigationItem, UUID> {
  List<NavigationItem> findAllByVisibilityOrderBySortOrderAsc(Visibility visibility);

  @Query("""
    SELECT n FROM NavigationItem n
    WHERE n.visibility = :visibility
      AND (
        LOWER(n.title) LIKE LOWER(CONCAT('%', :term, '%'))
        OR LOWER(n.slug) LIKE LOWER(CONCAT('%', :term, '%'))
        OR LOWER(COALESCE(n.href, '')) LIKE LOWER(CONCAT('%', :term, '%'))
      )
    ORDER BY n.sortOrder ASC
    """)
  List<NavigationItem> searchPublic(@Param("visibility") Visibility visibility,
                                    @Param("term") String term,
                                    Pageable pageable);
}
