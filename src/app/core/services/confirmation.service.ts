import { inject, Injectable } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NotificationService } from './notification.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {

  private modal = inject(NzModalService);
  private notification = inject(NotificationService);

  /**
   * Modal genérico para cambiar estado (Activar/Desactivar).
   * @param entityName 'Cliente', 'Asesor', etc.
   * @param itemName Nombre propio (Juan Perez).
   * @param currentStatus Estado actual (true = Activo).
   * @param request$ El Observable de la petición HTTP.
   */
  toggleStatus(
    entityName: string,
    itemName: string,
    currentStatus: boolean,
    request$: Observable<any>
  ): Observable<boolean> {

    return new Observable(observer => {
      const action = currentStatus ? 'desactivar' : 'activar';
      const actionText = action.charAt(0).toUpperCase() + action.slice(1);

      this.modal.confirm({
        nzTitle: `¿${actionText} ${entityName.toLowerCase()}?`,
        nzContent: `Se ${action}á a ${itemName}.`,
        nzOkText: 'Confirmar',
        nzOkDanger: currentStatus, // Rojo si está desactivando
        nzOnOk: () => {
          request$.subscribe({
            next: () => {
              this.notification.success(`${entityName} ${action}do`);
              observer.next(true);
              observer.complete();
            },
            error: (err) => {
              const backendMessage = err?.error?.message;
              const errroMessage = backendMessage ? backendMessage : `No se pudo ${action} la ${entityName.toLowerCase()}`;
              //this.notification.error(backendMessage || `No se pudo ${action} el ${entityName.toLowerCase()}`);
              this.notification.error(errroMessage);
              console.error('Error completo del backend ', err);
              observer.error(err);
            }
          });
        },
        nzOnCancel: () => {
          observer.next(false);
          observer.complete();
        }
      });
    });
  }

  /**
   * Modal genérico para confirmar eliminación permanente de un registro.
   * Muestra un botón rojo de peligro y soporta estados de carga.
   * 
   * @param entityName 'Reserva', 'Proyecto', etc.
   * @param itemName Identificador visual (código, nombre).
   * @param request$ Observable con la llamada HTTP.
   * @param isFeminine true si la entidad es femenina ('esta reserva', 'eliminada'), false si es masculina ('este lote', 'eliminado').
   */
  confirmDelete(
    entityName: string,
    itemName: string,
    request$: Observable<any>,
    isFeminine: boolean = true
  ): Observable<boolean> {
    const article = isFeminine ? 'esta' : 'este';
    const suffix = isFeminine ? 'a' : 'o';

    return new Observable(observer => {
      this.modal.confirm({
        nzTitle: `¿Está seguro de eliminar ${article} ${entityName.toLowerCase()}?`,
        nzContent: `Se eliminará permanentemente: ${itemName}. Esta acción no se puede deshacer.`,
        nzOkText: 'Confirmar',
        nzOkDanger: true,
        nzOnOk: () => new Promise<void>((resolve, reject) => {
          request$.subscribe({
            next: () => {
              this.notification.success(`${entityName} eliminad${suffix} correctamente`);
              observer.next(true);
              observer.complete();
              resolve();
            },
            error: (err) => {
              const backendMessage = err?.error?.message;
              const errorMessage = backendMessage ? backendMessage : `Error al eliminar ${article} ${entityName.toLowerCase()}`;
              this.notification.error(errorMessage);
              observer.error(err);
              reject(err);
            }
          });
        }),
        nzOnCancel: () => {
          observer.next(false);
          observer.complete();
        }
      });
    });
  }
}
