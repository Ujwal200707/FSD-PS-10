@echo off
REM Updated Maven Setup Script for LMS Backend (no JDK force, uses current Java 25)
REM Run as Administrator or normal

echo Checking PowerShell execution policy...
powershell -Command "Get-ExecutionPolicy"

echo Downloading Apache Maven 3.9.9...
powershell -Command "Invoke-WebRequest -Uri 'https://archive.apache.org/dist/maven/maven-3/3.9.9/binaries/apache-maven-3.9.9-bin.zip' -OutFile 'maven.zip'"

echo Creating tools dir...
if not exist "C:\tools" mkdir C:\tools

echo Extracting Maven...
powershell -Command "Expand-Archive -Path 'maven.zip' -DestinationPath 'C:\tools'"

REM Set JAVA_HOME from current java
for /f "tokens=* " %%i in ('where java') do (
  set "FULLPATH=%%i"
  set "JAVA_HOME=!FULLPATH:\bin\java.exe=!"
)

set "MAVEN_HOME=C:\tools\apache-maven-3.9.9"

REM Add to USER PATH (no admin needed)
setx JAVA_HOME "%JAVA_HOME%" /M:0
setx MAVEN_HOME "%MAVEN_HOME%" /M:0
setx PATH "%PATH%;%JAVA_HOME%\bin;%MAVEN_HOME%\bin" /M:0

echo Setup complete!
echo 1. Delete maven.zip if present
echo 2. Close ALL terminals/VSCode
echo 3. Reopen VSCode/terminal
echo 4. Test: mvn -version
echo 5. cd backend ^&^& mvn spring-boot:run
pause
