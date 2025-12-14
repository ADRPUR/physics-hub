plugins {
  `java-library`
}

dependencies {
  api(project(":shared-kernel"))
  implementation("org.springframework:spring-context:6.2.0")
  compileOnly("jakarta.persistence:jakarta.persistence-api:3.1.0")
  compileOnly("org.hibernate.orm:hibernate-core:6.6.4.Final")
}
