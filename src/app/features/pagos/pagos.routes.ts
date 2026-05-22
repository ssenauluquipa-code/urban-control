import { Routes } from "@angular/router";
import { permissionGuard } from "src/app/core/guards/permission.guard";
import { EAppAction, EAppModule } from "src/app/core/config/permissions.enum";

export const PagosRoutes: Routes = [
    {
        path: "",
        canActivate: [permissionGuard],
        data: {
            title: "Gestión de Pagos",
            breadcrumb: "Pagos",
            module: EAppModule.PAGOS,
            action: EAppAction.VIEW,
        },
        loadComponent: () =>
            import("./page/list-pagos.component").then((m) => m.ListPagosComponent),
    },
    {
        path: "register",
        canActivate: [permissionGuard],
        data: {
            title: "Registro de Pago",
            breadcrumb: "Nuevo",
            module: EAppModule.PAGOS,
            action: EAppAction.CREATE,
        },
        loadComponent: () =>
            import("./page/register-pagos.component").then((m) => m.RegisterPagosComponent),
    },
    {
        path: "detail/:id",
        canActivate: [permissionGuard],
        data: {
            title: "Detalle de Pago",
            breadcrumb: "Detalle",
            module: EAppModule.PAGOS,
            action: EAppAction.VIEW,
        },
        loadComponent: () =>
            import("./page/info-pagos.component").then((m) => m.InfoPagosComponent),
    },
];