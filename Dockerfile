FROM eclipse-temurin:21-jdk AS build

WORKDIR /workspace

COPY . .
RUN ./gradlew :fizicamd-app:bootJar -x test --no-daemon

FROM eclipse-temurin:21-jre

WORKDIR /app

ENV JAVA_OPTS=""

COPY --from=build /workspace/fizicamd-app/build/libs/*.jar /app/app.jar
RUN mkdir -p /app/storage/media

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
