import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { EPageAction, EPageMenuAction } from 'src/app/core/models/page-action.enum';
import { PageActionService, AnyPageAction } from 'src/app/core/services/page-action.service';
import { PermissionService } from 'src/app/core/services/permission.service';
import { IPageConfig, DEFAULT_PAGE_CONFIG } from 'src/app/core/models/page-config.interface';

@Component({
  selector: 'app-sub-header',
  standalone: true,
  imports: [CommonModule, NzButtonModule, NzDropDownModule, NzIconModule, NzMenuModule],
  templateUrl: './sub-header.component.html',
  styleUrls: ['./sub-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubHeaderComponent {
  private pageActionService = inject(PageActionService);
  private permissionService = inject(PermissionService);
  private router = inject(Router);
  private location = inject(Location);

  @Input() title: string = '';
  @Input() permissionScope?: string;
  @Input() backRoute?: string[];
  @Input() hasBackListener: boolean = false;
  
  @Input() config: IPageConfig = { ...DEFAULT_PAGE_CONFIG };

  public readonly A = EPageAction;
  public readonly M = EPageMenuAction;

  get canShowNew(): boolean { return !!this.config.showNew && (!this.permissionScope || this.permissionService.can(`${this.permissionScope}.create`)); }
  get canShowSave(): boolean { return !!this.config.showSave && (!this.permissionScope || this.permissionService.can(`${this.permissionScope}.update`)); }
  get canShowEdit(): boolean { return !!this.config.showEdit && (!this.permissionScope || this.permissionService.can(`${this.permissionScope}.update`)); }
  get canShowDelete(): boolean { return !!this.config.showDelete && (!this.permissionScope || this.permissionService.can(`${this.permissionScope}.delete`)); }
  get canShowUpdate(): boolean { return !!this.config.showUpdate && (!this.permissionScope || this.permissionService.can(`${this.permissionScope}.read`)); }

  get canShowCancel(): boolean { return !!this.config.showCancel; }
  get canShowSend(): boolean { return !!this.config.showSend; }
  get canShowOptions(): boolean { return !!this.config.showOptions; }
  get canShowExportExcel(): boolean { return !!this.config.showExportExcel; }
  get canShowExportPdf(): boolean { return !!this.config.showExportPdf; }
  get canShowImportExcel(): boolean { return !!this.config.showImportExcel; }
  get canShowPrint(): boolean { return !!this.config.showPrint; }
  get canShowLog(): boolean { return !!this.config.showLog; }
  get canShowBack(): boolean { return !!this.config.showBack; }

  get hasPrimaryActions(): boolean {
    return this.canShowNew || this.canShowSave || this.canShowSend;
  }

  get hasSecondaryActions(): boolean {
    return this.canShowEdit || this.canShowDelete || this.canShowCancel || this.canShowUpdate;
  }

  get hasMobileActions(): boolean {
    return this.hasPrimaryActions || this.hasSecondaryActions;
  }

  emitAction(action: AnyPageAction): void {
    if (action === EPageAction.BACK && !this.hasBackListener) {
      if (this.backRoute) {
        this.router.navigate(this.backRoute);
      } else {
        this.location.back();
      }
      return;
    }
    
    this.pageActionService.emitAction(action);
  }
}
