export interface IPageConfig {
  showBack?: boolean;
  showNew?: boolean;
  showSave?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  showCancel?: boolean;
  showUpdate?: boolean;
  showSend?: boolean;

  showOptions?: boolean;
  showExportExcel?: boolean;
  showExportPdf?: boolean;
  showImportExcel?: boolean;
  showPrint?: boolean;
  showLog?: boolean;
}

export const DEFAULT_PAGE_CONFIG: IPageConfig = {
  showBack: false,
  showNew: false,
  showSave: false,
  showEdit: false,
  showDelete: false,
  showCancel: false,
  showUpdate: false,
  showSend: false,
  showOptions: true,
  showExportExcel: true,
  showExportPdf: true,
  showImportExcel: false,
  showPrint: false,
  showLog: false,
};
