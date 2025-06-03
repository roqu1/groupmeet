# Build stage
FROM eclipse-temurin:17-jdk as build
WORKDIR /app

COPY gradle gradle
COPY gradlew .
COPY build.gradle .
COPY settings.gradle .
RUN chmod +x gradlew

COPY src ./src

# Build the application
RUN ./gradlew build -x test

# Run stage
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy the built jar from build stage
COPY --from=build /app/build/libs/demo-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]