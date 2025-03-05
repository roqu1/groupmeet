FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

COPY gradle gradle
COPY gradlew .
COPY build.gradle .
COPY settings.gradle .
RUN chmod +x gradlew

COPY src ./src

EXPOSE 8080
CMD ["./gradlew", "bootRun"]