package md.fizicamd.app.api.publicsite;

import md.fizicamd.app.analytics.SiteVisit;
import md.fizicamd.app.analytics.SiteVisitRepository;
import md.fizicamd.app.security.JwtAuthFilter;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PublicVisitsController.class)
@AutoConfigureMockMvc(addFilters = false)
@ImportAutoConfiguration(exclude = {
  DataSourceAutoConfiguration.class,
  HibernateJpaAutoConfiguration.class,
  JpaRepositoriesAutoConfiguration.class
})
@ContextConfiguration(classes = PublicVisitsController.class)
class PublicVisitsControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @MockBean
  private SiteVisitRepository visitRepository;

  @MockBean
  private JwtAuthFilter jwtAuthFilter;

  @Test
  void storesVisitMetadata() throws Exception {
    mockMvc.perform(post("/api/public/visits")
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"path\":\"/resources\",\"referrer\":\"https://example.com\"}")
        .header("X-Forwarded-For", "203.0.113.10, 70.0.0.1")
        .header("User-Agent", "TestAgent/1.0"))
      .andExpect(status().isOk());

    var captor = ArgumentCaptor.forClass(SiteVisit.class);
    verify(visitRepository).save(captor.capture());

    var saved = captor.getValue();
    assertThat(saved.getIpAddress()).isEqualTo("203.0.113.10");
    assertThat(saved.getUserAgent()).isEqualTo("TestAgent/1.0");
    assertThat(saved.getPath()).isEqualTo("/resources");
    assertThat(saved.getReferrer()).isEqualTo("https://example.com");
  }

  @Test
  void returnsTotalCount() throws Exception {
    when(visitRepository.count()).thenReturn(42L);

    mockMvc.perform(get("/api/public/visits/count").accept(MediaType.APPLICATION_JSON))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.total").value(42));
  }
}
