FROM maven:openjdk

WORKDIR /opt/app
COPY . /opt/app
RUN mvn clean package

EXPOSE 8000
ENTRYPOINT ["java", "-jar", "target/quickstart-1.0-SNAPSHOT.jar", "server", "config.yml"]
