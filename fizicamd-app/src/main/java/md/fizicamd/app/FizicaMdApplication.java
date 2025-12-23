package md.fizicamd.app;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = "md.fizicamd")
@EntityScan(basePackages = "md.fizicamd")
@EnableJpaRepositories(basePackages = "md.fizicamd")
@EnableScheduling
public class FizicaMdApplication {
  private static final Logger log = LoggerFactory.getLogger(FizicaMdApplication.class);
  private final Environment environment;

  public FizicaMdApplication(Environment environment) {
    this.environment = environment;
  }

  public static void main(String[] args) {
    SpringApplication.run(FizicaMdApplication.class, args);
  }

  @EventListener(ApplicationReadyEvent.class)
  public void onReady() {
    var port = environment.getProperty("server.port", "8080");
    var profiles = String.join(",", environment.getActiveProfiles());
    log.info("FizicaMD started on port {}{}", port, profiles.isBlank() ? "" : " (profiles: " + profiles + ")");
  }
}
