FROM maven:3.9.12-eclipse-temurin-21

WORKDIR /opt/app
COPY . .
WORKDIR /opt/app/java

RUN mvn clean package

EXPOSE 8000
ENTRYPOINT ["java"]
CMD ["-jar", "target/quickstart-1.0-SNAPSHOT.jar", "server", "config.yml"]
