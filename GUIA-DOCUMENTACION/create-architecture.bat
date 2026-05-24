@echo off
REM Script para crear estructura SOLID + Clean Architecture
REM Usage: create-architecture.bat feature-slug entity
REM Example: create-architecture.bat gestion-inmobiliario lote

if "%~1"=="" or "%~2"=="" (
  echo Usage: %0 ^<feature-slug^> ^<entity^>
  echo Example: %0 gestion-inmobiliario lote
  pause
  exit /b 1
)

set SLUG=%~1
set ENTITY=%~2
for /f "tokens=*" %%a in ('powershell -command \"[char[]] '%ENTITY%' | ForEach { if ($_ -cmatch '^[a-z]') { ($_ -creplace '^[a-z]', { $_.ToUpper() }) } else { $_ } } -join '' \"') do set ENTITY_PASCAL=%%a
powershell -command \"Write-Host '%SLUG%' | %% { ($_ -replace '-', ' ').Split() | ForEach { ($_[0].ToUpper() + $_.Substring(1).ToLower()) } } -join ' ' \" > temp.txt & set /p FEATURE_SPACED= < temp.txt & del temp.txt
set FEATURE_DIR=%FEATURE_SPACED: =-%

if "%SLUG%"=="gestion-inmobiliario" set FEATURE_DIR=Gestión-Inmobiliaria
powershell -command \"Write-Host '%SLUG%' -replace '[a-z]', { $_.ToUpper() } \" > temp.txt & set /p SLUG_UPPER= < temp.txt & del temp.txt

echo ==========================================
echo Creando estructura SOLID para: %SLUG% / %ENTITY%
echo Feature dir: %FEATURE_DIR%
echo ==========================================

REM Create directories
mkdir "src\app\core\models\%SLUG%" 2>nul
mkdir "src\app\core\repository\%SLUG%" 2>nul
mkdir "src\app\core\services\%SLUG%" 2>nul
mkdir "src\app\features\%FEATURE_DIR%\pages" 2>nul
mkdir "src\app\features\%FEATURE_DIR%\views" 2>nul

echo. & echo [OK] Directorios creados

REM Model
(
echo export interface I%ENTITY_PASCAL% {
echo   id: string^;
echo   // Add fields here
echo }
echo.
echo export interface Create%ENTITY_PASCAL%Dto {
echo   // Add fields here
echo }
echo.
echo export interface Update%ENTITY_PASCAL%Dto extends Partial^<Create%ENTITY_PASCAL%Dto^> { }
) > "src\app\core\models\%SLUG%\%ENTITY%.model.ts"

REM Repository
(
echo import { Injectable } from '@angular/core'^;
echo import { HttpClient } from '@angular/common/http'^;
echo import { Observable } from 'rxjs'^;
echo import { IENTITY, CreateENTITYDto, UpdateENTITYDto } from '../models/ENTITY.model'^;
echo.
echo @Injectable({
echo   providedIn: 'root'
echo })
echo export class ENTITYRepository {
echo   private readonly API_URL = '/api/SLUG/ENTITYs'^;
echo.
echo   constructor(private http: HttpClient) { }
echo.
echo   getAll^(^): Observable^<IENTITY[]^> {
echo     return this.http.get^<IENTITY[]^>(this.API_URL^);
echo   }
echo.
echo   getById^(id: string^): Observable^<IENTITY^> {
echo     return this.http.get^<IENTITY^>^(`\${this.API_URL}/\${id}`^)^;
echo   }
echo.
echo   create^(dto: CreateENTITYDto^): Observable^<IENTITY^> {
echo     return this.http.post^<IENTITY^>(this.API_URL, dto^)^;
echo   }
echo.
echo   update^(id: string, dto: UpdateENTITYDto^): Observable^<IENTITY^> {
echo     return this.http.put^<IENTITY^>^(`\${this.API_URL}/\${id}`, dto^)^;
echo   }
echo.
echo   delete^(id: string^): Observable^<void^> {
echo     return this.http.delete^<void^>^(`\${this.API_URL}/\${id}`^)^;
echo   }
echo }
) > "src\app\core\repository\%SLUG%\%ENTITY%.repository.ts"

powershell -command "(Get-Content 'src\\app\\core\\repository\\%SLUG%\\%ENTITY%.repository.ts') -replace 'IENTITY', 'I%ENTITY_PASCAL%' -replace 'CreateENTITYDto', 'Create%ENTITY_PASCAL%Dto' -replace 'UpdateENTITYDto', 'Update%ENTITY_PASCAL%Dto' -replace 'ENTITYRepository', '%ENTITY_PASCAL%Repository' -replace '/api/SLUG/ENTITYs', '/api/%SLUG%/%ENTITY%s' -replace 'models/ENTITY.model', 'models/%ENTITY%.model' | Set-Content 'src\\app\\core\\repository\\%SLUG%\\%ENTITY%.repository.ts'"

REM Service
(
echo import { Injectable } from '@angular/core'^;
echo import { Observable } from 'rxjs'^;
echo import { %ENTITY_PASCAL%Repository } from '../repository/%SLUG%/%ENTITY%.repository'^;
echo import { I%ENTITY_PASCAL% } from '../models/%SLUG%/%ENTITY%.model'^;
echo.
echo @Injectable({
echo   providedIn: 'root'
echo })
echo export class %ENTITY_PASCAL%Service {
echo   constructor^(private repository: %ENTITY_PASCAL%Repository^) { }
echo.
echo   getAll^(^): Observable^<I%ENTITY_PASCAL%[]^> {
echo     return this.repository.getAll^(^)^;
echo   }
echo.
echo   // Add business logic here
echo }
) > "src\app\core\services\%SLUG%\%ENTITY%.service.ts"

REM Routes
(
echo import { Routes } from "@angular/router"^;
echo.
echo export const %SLUG_UPPER%_ROUTES: Routes = [
echo   // Add routes here
echo ]^;
) > "src\app\features\%FEATURE_DIR%\%SLUG%.routes.ts"

echo [OK] Archivos plantilla generados:
echo   - core/models/%SLUG%/%ENTITY%.model.ts
echo   - core/repository/%SLUG%/%ENTITY%.repository.ts
echo   - core/services/%SLUG%/%ENTITY%.service.ts
echo   - features/%FEATURE_DIR%/%SLUG%.routes.ts
echo.
echo ==========================================
echo Estructura SOLID lista! Edita los templates.
echo ==========================================

pause

