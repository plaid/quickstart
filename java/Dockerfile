FROM maven:openjdk

WORKDIR /opt/app
COPY . .
WORKDIR /opt/app/java

RUN mvn clean package

EXPOSE 8000
ENTRYPOINT ["java"]
CMD ["-jar", "target/quickstart-1.0-SNAPSHOT.jar", "server", "config.yml"]
