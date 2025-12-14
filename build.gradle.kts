plugins {
  id("org.springframework.boot") version "3.4.1" apply false
  id("io.spring.dependency-management") version "1.1.6" apply false
  kotlin("jvm") version "2.0.21" apply false // doar dacă ai Kotlin
}

allprojects {
  group = "md.fizicamd"
  version = "0.1.0-SNAPSHOT"

  repositories {
    mavenCentral()
  }
}

subprojects {
  // common Java toolchain
  plugins.withType<JavaPlugin> {
    the<JavaPluginExtension>().toolchain {
      languageVersion.set(JavaLanguageVersion.of(21))
    }
  }
}

