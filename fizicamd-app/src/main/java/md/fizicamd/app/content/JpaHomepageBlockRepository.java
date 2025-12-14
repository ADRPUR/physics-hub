package md.fizicamd.app.content;

import md.fizicamd.content.homepage.HomepageBlock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface JpaHomepageBlockRepository extends JpaRepository<HomepageBlock, UUID> {
  List<HomepageBlock> findAllByOrderBySortOrderAsc();
  List<HomepageBlock> findByBlockTypeOrderBySortOrderAsc(String blockType);
}
