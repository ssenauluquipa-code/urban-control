import { Routes } from "@angular/router";
export const PagosRoutes: Routes = [
    {
        path: "",
        loadComponent: () => import("./page/list-pagos.component").then(m => m.ListPagosComponent),
    },
];