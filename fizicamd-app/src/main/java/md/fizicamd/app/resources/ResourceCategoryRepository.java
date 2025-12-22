package md.fizicamd.app.resources;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ResourceCategoryRepository extends JpaRepository<ResourceCategory, UUID> {
  Optional<ResourceCategory> findByCode(String code);
  List<ResourceCategory> findAllByOrderByGroupOrderAscSortOrderAsc();
  List<ResourceCategory> findByGroupLabel(String groupLabel);
  boolean existsByCode(String code);

  @Query("SELECT COALESCE(MAX(c.groupOrder), 0) FROM ResourceCategory c")
  Integer findMaxGroupOrder();

  @Query("SELECT COALESCE(MAX(c.sortOrder), 0) FROM ResourceCategory c WHERE c.groupLabel = :groupLabel")
  Integer findMaxSortOrderInGroup(@Param("groupLabel") String groupLabel);
}
