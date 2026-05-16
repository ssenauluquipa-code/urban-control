import { EAppModule } from 'src/app/core/config/permissions.enum';

// Sidebar route metadata
export interface IRouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
  extralink: boolean;
  submenu: IRouteInfo[];
  module?: EAppModule;
}
