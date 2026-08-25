import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router'
import { UsuariosListComponent } from './modulos/usuarios/usuarios-list/usuarios-list.component'
import { AlmacenesListComponent } from './modulos/almacen/almacenes-list/almacenes-list.component'
import { ZonaListComponent } from './modulos/zona/zona-list/zona-list.component'
import { ZonaFormComponent } from './modulos/zona/zona-form/zona-form.component'
import { CategoriaComponent } from './modulos/inventario/categoria/categoria.component'
import { ProductosComponent } from './modulos/inventario/productos/productos.component'

import { NavMenuComponent } from './nav-menu/nav-menu/nav-menu.component';
import { InicioComponent } from './inicio/inicio.component';


const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: NavMenuComponent
  },
  {
    path: 'inicio',
    component: InicioComponent
  },
  {
    path: 'usuarios',
    component: UsuariosListComponent
  }, {
    path: 'almacenes',
    component: AlmacenesListComponent
  }, {
    path: 'zonas',
    component: ZonaListComponent
  }, {
    path: 'zonas/agregar',
    component: ZonaFormComponent
  },
  {
    path: 'zonas/editar/:id',
    component: ZonaFormComponent
  },
  {
    path: 'categoria',
    component: CategoriaComponent
  },
  {
    path: 'productos',
    component: ProductosComponent
  },



];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
