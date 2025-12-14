plugins {
  `java-library`
}

dependencies {
  api(project(":shared-kernel"))
  compileOnly("jakarta.persistence:jakarta.persistence-api:3.1.0")
  implementation("org.springframework:spring-context:6.2.0")
}
