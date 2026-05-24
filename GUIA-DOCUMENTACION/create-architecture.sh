#!/bin/bash

# Script para crear estructura SOLID + Clean Architecture
# Usage: ./create-architecture.sh <feature-slug> <entity>
# Example: ./create-architecture.sh gestion-inmobiliario lote

if [ $# -ne 2 ]; then
  echo "Usage: $0 <feature-slug> <entity>"
  echo "Example: $0 gestion-inmobiliario lote"
  exit 1
fi

SLUG="$1"
ENTITY="$2"
ENTITY_PASCAL=$(echo "$ENTITY" | sed 's/.*/\U&/')
SLUG_UPPER=$(echo "$SLUG" | tr '[:lower:]' '[:upper:]')

# Derive feature dir name
case "$SLUG" in
  "gestion-inmobiliario")
    FEATURE_DIR="Gestión-Inmobiliaria"
    ;;
  *)
    FEATURE_DIR=$(echo "$SLUG" | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2)); print }' | tr ' ' '-')
    ;;
esac

echo "=========================================="
echo "Creando estructura SOLID para: $SLUG / $ENTITY"
echo "Feature dir: $FEATURE_DIR"
echo "=========================================="

# Create directories
mkdir -p "src/app/core/models/$SLUG"
mkdir -p "src/app/core/repository/$SLUG"
mkdir -p "src/app/core/services/$SLUG"
mkdir -p "src/app/features/$FEATURE_DIR/pages"
mkdir -p "src/app/features/$FEATURE_DIR/views"

echo "✅ Directorios creados"

# Model template
cat << EOF > "src/app/core/models/$SLUG/${ENTITY}.model.ts"
export interface I${ENTITY_PASCAL} {
  id: string;
  // Add fields here
}

export interface Create${ENTITY_PASCAL}Dto {
  // Add fields here
}

export interface Update${ENTITY_PASCAL}Dto extends Partial<Create${ENTITY_PASCAL}Dto> {}
EOF

# Repository template
cat << 'EOF' > "src/app/core/repository/$SLUG/${ENTITY}.repository.ts"
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IENTITY, CreateENTITYDto, UpdateENTITYDto } from '../models/ENTITY.model';

@Injectable({
  providedIn: 'root'
})
export class ENTITYRepository {
  private readonly API_URL = '/api/SLUG/ENTITYs';

  constructor(private http: HttpClient) {}

  getAll(): Observable<IENTITY[]> {
    return this.http.get<IENTITY[]>(this.API_URL);
  }

  getById(id: string): Observable<IENTITY> {
    return this.http.get<IENTITY>(\\\`\\\${this.API_URL}/\\\${id}\\\`);
  }

  create(dto: CreateENTITYDto): Observable<IENTITY> {
    return this.http.post<IENTITY>(this.API_URL, dto);
  }

  update(id: string, dto: UpdateENTITYDto): Observable<IENTITY> {
    return this.http.put<IENTITY>(\\\`\\\${this.API_URL}/\\\${id}\\\`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(\\\`\\\${this.API_URL}/\\\${id}\\\`);
  }
}
EOF

# Replace placeholders
sed -i "s/IENTITY/I${ENTITY_PASCAL}/g" "src/app/core/repository/$SLUG/${ENTITY}.repository.ts"
sed -i "s/CreateENTITYDto/Create${ENTITY_PASCAL}Dto/g" "src/app/core/repository/$SLUG/${ENTITY}.repository.ts"
sed -i "s/UpdateENTITYDto/Update${ENTITY_PASCAL}Dto/g" "src/app/core/repository/$SLUG/${ENTITY}.repository.ts"
sed -i "s/ENTITYRepository/${ENTITY_PASCAL}Repository/g" "src/app/core/repository/$SLUG/${ENTITY}.repository.ts"
sed -i "s|SLUG/ENTITYs|${SLUG}/${ENTITY}s|g" "src/app/core/repository/$SLUG/${ENTITY}.repository.ts"
sed -i "s/ENTITY.model/${ENTITY}.model/g" "src/app/core/repository/$SLUG/${ENTITY}.repository.ts"

# Service template
cat << EOF > "src/app/core/services/$SLUG/${ENTITY}.service.ts"
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ${ENTITY_PASCAL}Repository } from '../repository/$SLUG/${ENTITY}.repository';
import { I${ENTITY_PASCAL} } from '../models/$SLUG/${ENTITY}.model';

@Injectable({
  providedIn: 'root'
})
export class ${ENTITY_PASCAL}Service {
  constructor(private repository: ${ENTITY_PASCAL}Repository) {}

  getAll(): Observable<I${ENTITY_PASCAL}[]> {
    return this.repository.getAll();
  }

  // Add business logic here
}
EOF

# Routes template
cat << EOF > "src/app/features/$FEATURE_DIR/${SLUG}.routes.ts"
import { Routes } from "@angular/router";

export const ${SLUG_UPPER}_ROUTES: Routes = [
  // Add routes here
];
EOF

echo "✅ Archivos plantilla generados:"
echo "  - core/models/$SLUG/${ENTITY}.model.ts"
echo "  - core/repository/$SLUG/${ENTITY}.repository.ts"
echo "  - core/services/$SLUG/${ENTITY}.service.ts"
echo "  - features/$FEATURE_DIR/${SLUG}.routes.ts"
echo ""
echo "=========================================="
echo "¡Estructura SOLID lista! Edita los templates según necesites."
echo "=========================================="

