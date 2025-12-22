package md.fizicamd.app.api.resources;

import md.fizicamd.app.resources.ResourceEntry;
import md.fizicamd.app.resources.ResourceService;
import md.fizicamd.app.security.JwtAuthFilter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static md.fizicamd.app.api.resources.ResourceDtos.ResourceCardDto;
import static org.mockito.Mockito.mock;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PublicResourcesController.class)
@AutoConfigureMockMvc(addFilters = false)
@ImportAutoConfiguration(exclude = {
  DataSourceAutoConfiguration.class,
  HibernateJpaAutoConfiguration.class,
  JpaRepositoriesAutoConfiguration.class
})
@ContextConfiguration(classes = PublicResourcesController.class)
class PublicResourcesControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @MockBean
  private ResourceService resourceService;

  @MockBean
  private ResourceMapper resourceMapper;

  @MockBean
  private JwtAuthFilter jwtAuthFilter;

  @Test
  void returnsPagedResourcesWithMetadata() throws Exception {
    var first = mock(ResourceEntry.class);
    var second = mock(ResourceEntry.class);
    var firstId = UUID.randomUUID();
    var secondId = UUID.randomUUID();
    when(first.getId()).thenReturn(firstId);
    when(second.getId()).thenReturn(secondId);
    var page = new PageImpl<>(List.of(first, second), PageRequest.of(1, 5), 12);

    when(resourceService.listPublishedPage(eq("cat-1"), eq(1), eq(5))).thenReturn(page);
    when(resourceMapper.toCard(first)).thenReturn(new ResourceCardDto(
      firstId,
      "Resursa 1",
      "resursa-1",
      "Sumar 1",
      null,
      null,
      List.of(),
      "Autor",
      null,
      null
    ));
    when(resourceMapper.toCard(second)).thenReturn(new ResourceCardDto(
      secondId,
      "Resursa 2",
      "resursa-2",
      "Sumar 2",
      null,
      null,
      List.of(),
      "Autor",
      null,
      null
    ));

    mockMvc.perform(get("/api/public/resources")
        .queryParam("category", "cat-1")
        .queryParam("limit", "5")
        .queryParam("page", "2")
        .accept(MediaType.APPLICATION_JSON))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.items.length()").value(2))
      .andExpect(jsonPath("$.total").value(12))
      .andExpect(jsonPath("$.page").value(2))
      .andExpect(jsonPath("$.size").value(5))
      .andExpect(jsonPath("$.items[0].title").value("Resursa 1"))
      .andExpect(jsonPath("$.items[1].title").value("Resursa 2"));
  }

  @Test
  void capsLimitAtThirty() throws Exception {
    when(resourceService.listPublishedPage(eq(null), eq(0), eq(30)))
      .thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 30), 0));

    mockMvc.perform(get("/api/public/resources")
        .queryParam("limit", "100")
        .queryParam("page", "1")
        .accept(MediaType.APPLICATION_JSON))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.size").value(30));

    verify(resourceService).listPublishedPage(null, 0, 30);
  }
}
