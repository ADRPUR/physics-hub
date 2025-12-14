plugins {
  `java-library`
  id("io.spring.dependency-management")
}

dependencyManagement {
  imports {
    mavenBom("org.springframework.boot:spring-boot-dependencies:3.4.1")
  }
}

dependencies {
  api(project(":shared-kernel"))

  // It does NOT depend on the core!

  implementation("org.springframework:spring-context:6.2.1")
  implementation("org.springframework:spring-tx:6.2.1")

  compileOnly("jakarta.persistence:jakarta.persistence-api:3.1.0")
  compileOnly("org.hibernate.orm:hibernate-core:6.6.4.Final")

  testImplementation("org.junit.jupiter:junit-jupiter:5.11.3")
}

tasks.test {
  useJUnitPlatform()
}
