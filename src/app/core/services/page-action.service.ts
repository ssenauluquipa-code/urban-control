import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { EPageAction, EPageMenuAction } from '../models/page-action.enum';

export type AnyPageAction = EPageAction | EPageMenuAction;

@Injectable()
export class PageActionService {
  private actionSubject = new Subject<AnyPageAction>();
  action$: Observable<AnyPageAction> = this.actionSubject.asObservable();

  emitAction(action: AnyPageAction): void {
    this.actionSubject.next(action);
  }
}
