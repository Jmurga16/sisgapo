import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { merge, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import Swal from 'sweetalert2';
import {
  AccionModal,
  DatosModal,
  ListaOpcion,
  ParametroApi,
  RespuestaUsuarios,
  UsuarioListado,
  ValorEstado
} from 'src/app/shared/models';
import { UsuariosModalComponent } from '../usuarios-modal/usuarios-modal.component';
import { UsuariosService } from '../usuarios.service';

@Component({
  selector: 'app-usuarios-list',
  templateUrl: './usuarios-list.component.html',
  styleUrls: ['./usuarios-list.component.css'],
})
export class UsuariosListComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly appName: string = 'Usuarios';
  readonly displayedColumns: string[] = [
    'nIdUsuario',
    'sNombrePersona',
    'sNombreUsuario',
    'sNombreRol',
    'sEstado',
    'Acciones',
  ];
  readonly lEstados: ListaOpcion[] = [
    { valor: 2, nombre: 'Todos' },
    { valor: 1, nombre: 'Activo' },
    { valor: 0, nombre: 'Inactivo' },
  ];
  readonly lRoles: ListaOpcion[] = [
    { valor: 0, nombre: 'Todos' },
    { valor: 1, nombre: 'Administrador' },
    { valor: 2, nombre: 'Supervisor' },
    { valor: 3, nombre: 'Asistente' },
  ];

  fNombre = new FormControl('');
  fRol = new FormControl(0);
  fEstado = new FormControl(2);
  dsUsuarios = new MatTableDataSource<UsuarioListado>([]);
  private filtrosSubscription: Subscription;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private usuariosService: UsuariosService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.filtrosSubscription = merge(
      this.fNombre.valueChanges,
      this.fRol.valueChanges,
      this.fEstado.valueChanges
    ).pipe(debounceTime(250)).subscribe(() => this.fnFiltrarUsuarios());

    this.fnFiltrarUsuarios();
  }

  ngAfterViewInit(): void {
    this.dsUsuarios.paginator = this.paginator;
    this.dsUsuarios.sort = this.sort;
  }

  ngOnDestroy(): void {
    if (this.filtrosSubscription) {
      this.filtrosSubscription.unsubscribe();
    }
  }

  async fnListarUsuarios(): Promise<void> {
    try {
      this.dsUsuarios.data = await this.usuariosService
        .fnServUsuarios<UsuarioListado[]>('01', []);
    } catch (error) {
      console.error(error as HttpErrorResponse);
    }
  }

  fnAbrirModal(accion: AccionModal, nIdUsuario: number): void {
    const datos: DatosModal = { accion, nId: nIdUsuario };
    const dialogRef = this.dialog.open(UsuariosModalComponent, {
      width: '50rem',
      maxWidth: '95vw',
      disableClose: true,
      data: datos,
    });

    dialogRef.afterClosed().subscribe((result: number | undefined) => {
      if (result !== undefined) {
        this.fnFiltrarUsuarios();
      }
    });
  }

  fnLimpiarFiltros(): void {
    this.fNombre.setValue('', { emitEvent: false });
    this.fRol.setValue(0, { emitEvent: false });
    this.fEstado.setValue(2, { emitEvent: false });
    this.fnFiltrarUsuarios();
  }

  async fnFiltrarUsuarios(): Promise<void> {
    const parametros: ParametroApi[] = [
      this.fNombre.value || '',
      this.fRol.value || 0,
      this.fEstado.value == null ? 2 : this.fEstado.value
    ];

    try {
      this.dsUsuarios.data = await this.usuariosService
        .fnServUsuarios<UsuarioListado[]>('02', parametros);
    } catch (error) {
      console.error(error as HttpErrorResponse);
    }
  }

  async fnCambiarEstado(nIdUsuario: number, estado: ValorEstado): Promise<void> {
    const activar = estado === ValorEstado.Activo;
    const confirmacion = await Swal.fire({
      title: activar ? '¿Desea activar el usuario?' : '¿Desea desactivar el usuario?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    try {
      const respuesta = await this.usuariosService.fnServUsuarios<RespuestaUsuarios>(
        '06',
        [nIdUsuario, estado]
      );

      if (respuesta.mensaje === 'OK') {
        await Swal.fire({
          title: activar
            ? 'Se activó el usuario con éxito'
            : 'Se desactivó el usuario con éxito',
          icon: 'success',
          timer: 3500
        });
      } else {
        await Swal.fire({
          title: 'No se pudo cambiar el estado',
          text: respuesta.mensaje,
          icon: 'error'
        });
      }

      await this.fnFiltrarUsuarios();
    } catch (error) {
      console.error(error as HttpErrorResponse);
    }
  }
}
