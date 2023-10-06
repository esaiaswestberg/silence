@echo off

:Start
pnpm tsx ./src/app.ts
echo Restarting in 10 seconds...
sleep 10
goto Start