@echo off
setlocal

set "ROOT=%~dp0"
cd /d "%ROOT%"

echo [Movie Business] Starte Backend auf http://localhost:8787 ...
start "Movie Business Backend" cmd /k "cd /d "%ROOT%" && node server\index.js"

REM Kurze Wartezeit, damit der Server hochfahren kann
timeout /t 2 /nobreak >nul

echo [Movie Business] Oeffne Verwaltung ...
start "" "http://localhost:8787/Verwaltung.html"

echo Fertig. Dieses Fenster kann geschlossen werden.
endlocal
