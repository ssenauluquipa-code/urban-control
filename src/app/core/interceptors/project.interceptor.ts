import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ProjectStatusGlobalService } from '../services/project-status-global.service'; 

export const projectInterceptor: HttpInterceptorFn = (req, next) => {
  const globalContext = inject(ProjectStatusGlobalService);
  const projectId = globalContext.currentProjectId(); // ⚡ Lectura síncrona del Signal global

  // Si hay un proyecto activo seleccionado, clonamos la petición e inyectamos el Header requerido
  if (projectId) {
    const clonedReq = req.clone({
      setHeaders: {
        'X-Project-Id': projectId // El Header idéntico al que te pide el backend
      }
    });
    return next(clonedReq);
  }

  return next(req);
};