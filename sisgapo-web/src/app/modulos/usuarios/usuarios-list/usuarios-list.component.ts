import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
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
export class UsuariosListComponent implements OnInit, AfterViewInit {
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

  fNombre = new FormControl();
  fRol = new FormControl();
  fEstado = new FormControl();
  dsUsuarios = new MatTableDataSource<UsuarioListado>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private usuariosService: UsuariosService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.fnListarUsuarios();
  }

  ngAfterViewInit(): void {
    this.dsUsuarios.paginator = this.paginator;
    this.dsUsuarios.sort = this.sort;
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
        this.fnListarUsuarios();
      }
    });
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
      title: activar ? '¿Desea activar el usuario?' : '¿Desea eliminar el usuario?',
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
            : 'Se eliminó el usuario con éxito',
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
