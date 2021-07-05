import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NoopAnimationsModule,BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UsuariosListComponent } from './modulos/usuarios/usuarios-list/usuarios-list.component';
import { UsuariosModalComponent } from './modulos/usuarios/usuarios-modal/usuarios-modal.component';
import { AlmacenesListComponent } from './modulos/almacen/almacenes-list/almacenes-list.component';
import { AlmacenesModalComponent } from './modulos/almacen/almacenes-modal/almacenes-modal.component';
import { NavMenuComponent } from './nav-menu/nav-menu/nav-menu.component';


//Services
import { AlmacenesService } from './modulos/almacen/almacenes.service';
import { InventarioService } from './modulos/inventario/inventario.service';
import { UsuariosService } from './modulos/usuarios/usuarios.service';

//Material Modules
import { MatButtonModule } from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ZonaListComponent } from './modulos/zona/zona-list/zona-list.component';
import { ZonaFormComponent } from './modulos/zona/zona-form/zona-form.component';
import { ProductosComponent } from './modulos/inventario/productos/productos.component';
import { CategoriaComponent } from './modulos/inventario/categoria/categoria.component';
import { CategoriaModalComponent } from './modulos/inventario/categoria/categoria-modal/categoria-modal.component';
import { ProductosModalComponent } from './modulos/inventario/productos/productos-modal/productos-modal.component';


@NgModule({
  declarations: [
    AppComponent,
    UsuariosListComponent,
    UsuariosModalComponent,
    AlmacenesListComponent,
    AlmacenesModalComponent,
    NavMenuComponent,
    ZonaListComponent,
    ZonaFormComponent,
    ProductosComponent,
    CategoriaComponent,
    CategoriaModalComponent,
    ProductosModalComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatListModule,
    MatSelectModule,
    MatSidenavModule,
    MatTableModule,
    MatToolbarModule,
    NoopAnimationsModule,
    NgbModule,
    NgSelectModule
  ],
  providers: [
    AlmacenesService, 
    InventarioService,
    UsuariosService,
    MatDatepickerModule,
    MatNativeDateModule,
    
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
