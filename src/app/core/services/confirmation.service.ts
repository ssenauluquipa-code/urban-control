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
              this.notification.error(`No se pudo ${action} el ${entityName.toLowerCase()}`);
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
}
