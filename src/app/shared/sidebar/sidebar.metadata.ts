// Sidebar route metadata
export interface IRouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
  extralink: boolean;
  submenu: IRouteInfo[];
}
