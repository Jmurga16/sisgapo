import { NgModule } from '@angular/core';
import {Routes,RouterModule} from '@angular/router'
import { CommonModule } from '@angular/common';
import {UsuariosListComponent} from './modulos/usuarios/usuarios-list/usuarios-list.component'
import {AlmacenesListComponent} from './modulos/almacen/almacenes-list/almacenes-list.component'
import { ZonaListComponent } from './modulos/zona/zona-list/zona-list.component'
import { ZonaFormComponent } from './modulos/zona/zona-form/zona-form.component'

const routes:Routes=[
  {
    path:'',
    redirectTo:'',
    pathMatch:'full'
  },
  {
    path:'usuarios',
    component:UsuariosListComponent
  },{
    path:'almacenes',
    component:AlmacenesListComponent
  },{
    path:'zonas',
    component:ZonaListComponent
  },{
    path:'zonas/agregar',
    component:ZonaFormComponent
  },
  {
    path:'zonas/editar/:id',
    component:ZonaFormComponent
  },



];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
