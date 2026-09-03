import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsuariosListComponent } from './modulos/usuarios/usuarios-list/usuarios-list.component';
import { AlmacenesListComponent } from './modulos/almacen/almacenes-list/almacenes-list.component';
import { ZonaListComponent } from './modulos/zona/zona-list/zona-list.component';
import { ZonaFormComponent } from './modulos/zona/zona-form/zona-form.component';
import { CategoriaComponent } from './modulos/inventario/categoria/categoria.component';
import { ProductosComponent } from './modulos/inventario/productos/productos.component';
import { LotesComponent } from './modulos/inventario/lotes/lotes.component';
import { MovimientosComponent } from './modulos/inventario/movimientos/movimientos.component';

import { NavMenuComponent } from './nav-menu/nav-menu/nav-menu.component';
import { InicioComponent } from './inicio/inicio.component';
import { AuthGuard } from './shared/services/auth.guard';
import { Rol } from './shared/models';

const rolesGestion = [Rol.Administrador, Rol.Supervisor];

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: NavMenuComponent },
  { path: 'inicio', component: InicioComponent, canActivate: [AuthGuard] },
  {
    path: 'usuarios',
    component: UsuariosListComponent,
    canActivate: [AuthGuard],
    data: { roles: [Rol.Administrador] }
  },
  {
    path: 'almacenes',
    component: AlmacenesListComponent,
    canActivate: [AuthGuard],
    data: { roles: rolesGestion }
  },
  {
    path: 'zonas',
    component: ZonaListComponent,
    canActivate: [AuthGuard],
    data: { roles: rolesGestion }
  },
  {
    path: 'zonas/agregar',
    component: ZonaFormComponent,
    canActivate: [AuthGuard],
    data: { roles: rolesGestion }
  },
  {
    path: 'zonas/editar/:id',
    component: ZonaFormComponent,
    canActivate: [AuthGuard],
    data: { roles: rolesGestion }
  },
  { path: 'categoria', component: CategoriaComponent, canActivate: [AuthGuard] },
  { path: 'productos', component: ProductosComponent, canActivate: [AuthGuard] },
  { path: 'lotes', component: LotesComponent, canActivate: [AuthGuard] },
  { path: 'movimientos', component: MovimientosComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
