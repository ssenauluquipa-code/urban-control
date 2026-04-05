import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IRouteInfo } from './sidebar.metadata';
import { ROUTES } from './menu-items';


@Injectable({
    providedIn: 'root'
})
export class VerticalSidebarService {

    public screenWidth: any;
    public collapseSidebar: boolean = false;
    public fullScreen: boolean = false;

    MENUITEMS: IRouteInfo[] = ROUTES;

    items = new BehaviorSubject<IRouteInfo[]>(this.MENUITEMS);

    constructor() {
    }
}
