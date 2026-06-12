# syntax=docker/dockerfile:1

FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

# Copy pom first to leverage Docker layer cache for dependencies
COPY mail-gateway-java/pom.xml ./
RUN mvn -q -DskipTests dependency:go-offline

# Copy application sources and package as an executable jar
COPY mail-gateway-java/src ./src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=build /app/target/*.jar /app/app.jar

EXPOSE 8080
ENV PORT=8080

# Java app must listen on 0.0.0.0:8080 (or update defaultPort in src/index.ts)
CMD ["java", "-jar", "/app/app.jar"]
