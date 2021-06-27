import { NgModule } from '@angular/core';
import {Routes,RouterModule} from '@angular/router'
import { CommonModule } from '@angular/common';
import {UsuariosListComponent} from './modulos/usuarios/usuarios-list/usuarios-list.component'
import {AlmacenesListComponent} from './modulos/almacen/almacenes-list/almacenes-list.component'
//import { ProductosListComponent } from './components/asignatura-form/asignatura-form.component';

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
  }


];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
