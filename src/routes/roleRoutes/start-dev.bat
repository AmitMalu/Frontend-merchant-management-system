@echo off

echo Starting Spring Boot Backend...
cd backend
start cmd /k mvn spring-boot:run

timeout /t 5

echo Starting React Frontend...
cd ..\frontend
start cmd /k npm start
Run:
start-dev.bat