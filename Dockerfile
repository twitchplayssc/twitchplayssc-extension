FROM openjdk:17-jdk-slim

EXPOSE 2323

ENV APP_HOME /usr/src/app
COPY target/extensionserver-2.0.0.jar $APP_HOME/app.jar

WORKDIR $APP_HOME
ENTRYPOINT ["java","-jar","/app.jar"]