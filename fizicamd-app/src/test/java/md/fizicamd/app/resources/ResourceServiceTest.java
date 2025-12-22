package md.fizicamd.app.resources;

import com.fasterxml.jackson.databind.ObjectMapper;
import md.fizicamd.identity.application.UserProfileRepository;
import md.fizicamd.identity.application.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ResourceServiceTest {

  @Mock
  private ResourceCategoryRepository categoryRepository;

  @Mock
  private ResourceEntryRepository entryRepository;

  @Mock
  private UserRepository userRepository;

  @Mock
  private UserProfileRepository profileRepository;

  @Mock
  private ObjectMapper objectMapper;

  @Test
  void listPublishedPageUsesCategoryFilter() {
    var service = new ResourceService(
      categoryRepository,
      entryRepository,
      userRepository,
      profileRepository,
      objectMapper
    );

    Page<ResourceEntry> page = new PageImpl<>(List.of(), PageRequest.of(0, 5), 0);
    when(entryRepository.findByCategoryCodeAndStatusOrderByPublishedAtDesc("cat", ResourceStatus.PUBLISHED, PageRequest.of(0, 5)))
      .thenReturn(page);

    var result = service.listPublishedPage("cat", 0, 5);

    assertThat(result).isSameAs(page);
    verify(entryRepository).findByCategoryCodeAndStatusOrderByPublishedAtDesc("cat", ResourceStatus.PUBLISHED, PageRequest.of(0, 5));
  }

  @Test
  void listPublishedPageUsesDefaultFilterWhenCategoryMissing() {
    var service = new ResourceService(
      categoryRepository,
      entryRepository,
      userRepository,
      profileRepository,
      objectMapper
    );

    Page<ResourceEntry> page = new PageImpl<>(List.of(), PageRequest.of(1, 10), 0);
    when(entryRepository.findByStatusOrderByPublishedAtDesc(ResourceStatus.PUBLISHED, PageRequest.of(1, 10)))
      .thenReturn(page);

    var result = service.listPublishedPage("  ", 1, 10);

    assertThat(result).isSameAs(page);
    verify(entryRepository).findByStatusOrderByPublishedAtDesc(ResourceStatus.PUBLISHED, PageRequest.of(1, 10));
  }
}
