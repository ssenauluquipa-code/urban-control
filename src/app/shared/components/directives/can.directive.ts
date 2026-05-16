import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { EAppAction, EAppModule } from 'src/app/core/config/permissions.enum';
import { AccessControlService } from 'src/app/core/services/access-control.service';

@Directive({
  selector: '[appCan]',
  standalone: true
})
export class CanDirective implements OnInit {

  @Input() appCan: [EAppModule, EAppAction] | null = null;

  constructor(private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private access: AccessControlService) { }


  ngOnInit(): void {
    if (this.appCan && this.access.can(this.appCan[0], this.appCan[1])) {
      // Tiene permiso: Mostramos el HTML
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      // No tiene permiso: Borramos el HTML del DOM
      this.viewContainer.clear();
    }
  }

}
