@echo off
REM Deploy RegsGuard to Vercel with Supabase updates
setlocal enabledelayedexpansion

echo === Deploying RegsGuard to Vercel ===

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if errorlevel 1 (
    echo Installing Vercel CLI...
    npm i -g vercel
)

REM Install dependencies
echo Installing dependencies...
npm install

REM Generate Prisma client
echo Generating Prisma client...
npx prisma generate

REM Run database migrations
echo Running database migrations...
npx prisma migrate deploy

REM Seed database if requested
if "%1"=="--seed" (
    echo Seeding database...
    npm run seed
)

REM Build the application
echo Building application...
npm run build

REM Deploy to Vercel
echo Deploying to Vercel...
vercel --prod

REM Verify deployment
echo Verifying deployment...
timeout /t 5 /nobreak >nul

REM Test health endpoint
echo Testing health endpoint...
curl -f https://your-app-name.vercel.app/api/health
if errorlevel 1 (
    echo Health check failed - check logs
    vercel logs
    exit /b 1
)

echo.
echo === Deploy complete! ===
echo Application deployed successfully to Vercel
echo View logs: vercel logs
echo Manage: https://vercel.com/your-org/your-project
