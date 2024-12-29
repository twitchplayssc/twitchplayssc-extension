FROM openjdk:17-jdk-slim

EXPOSE 2323

COPY target/extensionserver-2.0.0.jar /app.jar

ENTRYPOINT ["java","-jar","/app.jar"]