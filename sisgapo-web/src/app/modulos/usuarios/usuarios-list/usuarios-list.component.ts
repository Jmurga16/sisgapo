import { Component, OnInit, ViewChild } from '@angular/core';
import { UsuariosService } from '../usuarios.service';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from "@angular/material/dialog";

import { UsuariosModalComponent } from './../usuarios-modal/usuarios-modal.component'
import { ListaData } from './../Models/IUsuarios'
import Swal from "sweetalert2";


import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';


@Component({
  selector: 'app-usuarios-list',
  templateUrl: './usuarios-list.component.html',
  styleUrls: ['./usuarios-list.component.css'],
})
export class UsuariosListComponent implements OnInit {
  appName: string = 'Usuarios';
  usuarios: any = [];
  url: string;

  fNombre = new FormControl();
  fRol = new FormControl();
  fEstado = new FormControl();

  lEstados: ListaData[] = [
    { valor: 2, nombre: 'Todos' },
    { valor: 1, nombre: 'Activo' },
    { valor: 0, nombre: 'Inactivo' },
  ];

  lRoles: ListaData[] = [
    { valor: 0, nombre: 'Todos' },
    { valor: 1, nombre: 'Administrador' },
    { valor: 2, nombre: 'Supervisor' },
    { valor: 3, nombre: 'Asistente' },
  ];

  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = [
    'nIdUsuario',
    'sNombrePersona',
    'sNombreUsuario',
    'sNombreRol',
    'sEstado',
    'Acciones',
  ];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private usuariosService: UsuariosService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.url = 'https://localhost:44360/';

    this.fnListarUsuarios();

  }

  //#region Listar Usuarios
  async fnListarUsuarios() {
    let pParametro = [];

    await this.usuariosService.LIS_Usuarios('01', pParametro, this.url).then(
      (value: any[]) => {

        this.dataSource = new MatTableDataSource(value);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      (error) => {
        console.log(error);
      }
    );
  }
  //#endregion

  //#region Filtrar Usuarios
  async fnFiltrarUsuarios() {
    let bEstado;

    bEstado = this.fEstado.value == null ? 2 : this.fEstado.value; // Estado : Todos

    let pParametro = [];
    pParametro.push(this.fNombre.value);
    pParametro.push(this.fRol.value);
    pParametro.push(bEstado);

    await this.usuariosService.LIS_Usuarios('02', pParametro, this.url).then(
      (value: any[]) => {

        this.dataSource = new MatTableDataSource(value);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      (error) => {
        console.log(error);
      }
    );
  }
  //#endregion

  //#region Abrir Modal
  async fnAbrirModal(accion, nIdUsuario) {
    const dialogRef = this.dialog.open(UsuariosModalComponent, {
      width: '50rem',
      disableClose: true,
      data: {
        accion: accion, //0:Nuevo , 1:Editar
        nIdUsuario: nIdUsuario
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        this.fnListarUsuarios();
      }
    });
  }

  //#region Eliminar
  async fnCambiarEstado(nIdUsuario, bEstado) {

    let sTitulo, sRespuesta;

    if (bEstado == 0) {
      sTitulo = '¿Desea eliminar el usuario?'
      sRespuesta = 'Se eliminó el usuario con éxito'
    }
    else{
      sTitulo = '¿Desea activar el usuario?'
      sRespuesta = 'Se activó el usuario con éxito'
    }
    

    var resp = await Swal.fire({
      title: sTitulo,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    })

    if (!resp.isConfirmed) {
      return;
    }

    let pParametro = [];

    pParametro.push(nIdUsuario);
    pParametro.push(bEstado);

    await this.usuariosService.LIS_Usuarios('06', pParametro, this.url).then(
      (value: any) => {

        if (value.mensaje = "Ok") {
          Swal.fire({
            title: sRespuesta,
            icon: 'success',
            timer: 3500
          })
        }
        this.fnFiltrarUsuarios();

      },
      (error) => {
        console.log(error);
      }
    );
  }
  //#endregion
}
