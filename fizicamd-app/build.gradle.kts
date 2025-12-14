buildscript {
  repositories {
    mavenCentral()
  }
  dependencies {
    classpath("org.flywaydb:flyway-database-postgresql:10.20.1")
    classpath("org.postgresql:postgresql:42.7.4")
  }
}

plugins {
  id("org.springframework.boot") version "3.4.1"
  id("io.spring.dependency-management") version "1.1.6"
  id("org.flywaydb.flyway") version "10.20.1"
  java
}

group = "md.fizicamd"
version = "0.1.0-SNAPSHOT"

java {
  toolchain {
    languageVersion.set(JavaLanguageVersion.of(21))
  }
}

repositories {
  mavenCentral()
}

/**
 * Custom configuration that holds the JDBC driver + Flyway database support
 * used exclusively by the Gradle Flyway tasks (migrate/repair/etc.).
 */
val flywayMigration by configurations.creating {
  isVisible = false
  isCanBeConsumed = false
  isCanBeResolved = true
}

dependencies {
  implementation(project(":shared-kernel"))
  implementation(project(":identity"))
  implementation(project(":media"))
  implementation(project(":navigation"))
  implementation(project(":content"))
  implementation(project(":learning"))
  implementation(project(":fizicamd-core"))

  implementation("org.springframework.boot:spring-boot-starter-web")
  implementation("org.springframework.boot:spring-boot-starter-validation")
  implementation("org.springframework.boot:spring-boot-starter-security")
  implementation("org.springframework.boot:spring-boot-starter-data-jpa")

  implementation("org.springframework.boot:spring-boot-starter-actuator")
  runtimeOnly("org.postgresql:postgresql:42.7.4")

  // Flyway runtime (Spring Boot)
  implementation("org.flywaydb:flyway-database-postgresql")

  // OpenAPI
  implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.6.0")

  // JWT
  implementation("io.jsonwebtoken:jjwt-api:0.12.6")
  runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.6")
  runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.12.6")

  // Password hashing (Argon2)
  implementation("org.springframework.security:spring-security-crypto")
  implementation("org.bouncycastle:bcprov-jdk18on:1.79")

  // IMPORTANT: dependencies used by Gradle Flyway tasks (repair/migrate/etc.)
  flywayMigration("org.flywaydb:flyway-database-postgresql:10.20.1")
  flywayMigration("org.postgresql:postgresql:42.7.4")

  testImplementation("org.springframework.boot:spring-boot-starter-test")
  testImplementation("org.springframework.security:spring-security-test")
}

tasks.test {
  useJUnitPlatform()
}

flyway {
  url = "jdbc:postgresql://localhost:5432/fizicamd"
  user = "fizicamd"
  password = "fizicamd"
  schemas = arrayOf("public")
  locations = arrayOf("filesystem:src/main/resources/db/migration")
  configurations = arrayOf(flywayMigration.name)
}
