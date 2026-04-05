import { Component, ChangeDetectionStrategy, Output, EventEmitter, inject, OnInit, DestroyRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageActionService, AnyPageAction } from 'src/app/core/services/page-action.service';
import { EPageAction, EPageMenuAction } from 'src/app/core/models/page-action.enum';
import { SubHeaderComponent } from 'src/app/shared/components/organisms/sub-header/sub-header.component';
import { IPageConfig, DEFAULT_PAGE_CONFIG } from 'src/app/core/models/page-config.interface';

@Component({
  selector: 'app-page-container',
  standalone: true,
  imports: [SubHeaderComponent],
  template: `
    <div class="page-container-wrapper" style="display: flex; flex-direction: column; width: 100%; height: 100%;">
      <!-- SubHeader anidado automáticamente -->
      <app-sub-header
        [title]="title"
        [permissionScope]="permissionScope"
        [backRoute]="backRoute"
        [hasBackListener]="hasBackListener"
        [config]="mergedConfig">
        <div custom-actions style="display: contents;">
          <ng-content select="[custom-actions]"></ng-content>
        </div>
      </app-sub-header>
      
      <!-- Contenido Principal -->
      <div class="page-container-content py-3" style="flex: 1;">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PageActionService]
})
export class PageContainerComponent implements OnInit, OnChanges {
  private pageActionService = inject(PageActionService);
  private destroyRef = inject(DestroyRef);

  @Input() title: string = '';
  @Input() permissionScope?: string;
  @Input() backRoute?: string[];
  
  // Objeto de configuración unificado
  @Input() config?: IPageConfig;

  // Props legacy para retrocompatibilidad
  @Input() showBack?: boolean;
  @Input() showNew?: boolean;
  @Input() showSave?: boolean;
  @Input() showEdit?: boolean;
  @Input() showDelete?: boolean;
  @Input() showCancel?: boolean;
  @Input() showUpdate?: boolean;
  @Input() showSend?: boolean;

  @Input() showOptions?: boolean;
  @Input() showExportExcel?: boolean;
  @Input() showExportPdf?: boolean;
  @Input() showImportExcel?: boolean;
  @Input() showPrint?: boolean;
  @Input() showLog?: boolean;

  mergedConfig: IPageConfig = { ...DEFAULT_PAGE_CONFIG };

  @Output() onAddNew = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<void>();
  @Output() onEdit = new EventEmitter<void>();
  @Output() onDelete = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();
  @Output() onBack = new EventEmitter<void>();
  @Output() onUpdate = new EventEmitter<void>();
  @Output() onSend = new EventEmitter<void>();

  @Output() onMenuExportExcel = new EventEmitter<void>();
  @Output() onMenuExportPDF = new EventEmitter<void>();
  @Output() onMenuImportExcel = new EventEmitter<void>();
  @Output() onMenuPrint = new EventEmitter<void>();
  @Output() onMenuLog = new EventEmitter<void>();

  get hasBackListener(): boolean {
    return this.onBack.observed;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateMergedConfig();
  }

  private updateMergedConfig(): void {
    const baseConfig = { ...DEFAULT_PAGE_CONFIG };
    
    if (this.config) {
      Object.assign(baseConfig, this.config);
    }
    
    const inputsConfig: IPageConfig = {};
    if (this.showBack !== undefined) inputsConfig.showBack = this.showBack;
    if (this.showNew !== undefined) inputsConfig.showNew = this.showNew;
    if (this.showSave !== undefined) inputsConfig.showSave = this.showSave;
    if (this.showEdit !== undefined) inputsConfig.showEdit = this.showEdit;
    if (this.showDelete !== undefined) inputsConfig.showDelete = this.showDelete;
    if (this.showCancel !== undefined) inputsConfig.showCancel = this.showCancel;
    if (this.showUpdate !== undefined) inputsConfig.showUpdate = this.showUpdate;
    if (this.showSend !== undefined) inputsConfig.showSend = this.showSend;
    
    if (this.showOptions !== undefined) inputsConfig.showOptions = this.showOptions;
    if (this.showExportExcel !== undefined) inputsConfig.showExportExcel = this.showExportExcel;
    if (this.showExportPdf !== undefined) inputsConfig.showExportPdf = this.showExportPdf;
    if (this.showImportExcel !== undefined) inputsConfig.showImportExcel = this.showImportExcel;
    if (this.showPrint !== undefined) inputsConfig.showPrint = this.showPrint;
    if (this.showLog !== undefined) inputsConfig.showLog = this.showLog;

    this.mergedConfig = { ...baseConfig, ...inputsConfig };
  }

  ngOnInit(): void {
    this.updateMergedConfig();
    this.pageActionService.action$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((action: AnyPageAction) => {
        switch (action) {
          case EPageAction.NEW: this.onAddNew.emit(); break;
          case EPageAction.SAVE: this.onSave.emit(); break;
          case EPageAction.EDIT: this.onEdit.emit(); break;
          case EPageAction.DELETE: this.onDelete.emit(); break;
          case EPageAction.CANCEL: this.onCancel.emit(); break;
          case EPageAction.BACK: this.onBack.emit(); break;
          case EPageAction.UPDATE: this.onUpdate.emit(); break;
          case EPageAction.SEND: this.onSend.emit(); break;

          case EPageMenuAction.EXPORT_EXCEL: this.onMenuExportExcel.emit(); break;
          case EPageMenuAction.EXPORT_PDF: this.onMenuExportPDF.emit(); break;
          case EPageMenuAction.IMPORT_EXCEL: this.onMenuImportExcel.emit(); break;
          case EPageMenuAction.PRINT: this.onMenuPrint.emit(); break;
          case EPageMenuAction.LOG: this.onMenuLog.emit(); break;
        }
      });
  }
}
