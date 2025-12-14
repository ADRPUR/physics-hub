package md.fizicamd.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "md.fizicamd")
@EntityScan(basePackages = "md.fizicamd")
@EnableJpaRepositories(basePackages = "md.fizicamd")
public class FizicaMdApplication {
  public static void main(String[] args) {
    SpringApplication.run(FizicaMdApplication.class, args);
  }
}
