import { Component, OnInit, ViewChild } from '@angular/core';
import { UsuariosService } from '../usuarios.service';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from "@angular/material/dialog";

import { UsuariosModalComponent } from './../usuarios-modal/usuarios-modal.component'
import { EstadoData } from './../Models/IUsuarios'
//import Swal from "sweetalert2";


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

  lEstados: EstadoData[] = [
    { valor: 2, nombre: 'Todos' },
    { valor: 1, nombre: 'Activo' },
    { valor: 0, nombre: 'Inactivo' },
  ];

  lRoles: any[] = [
    { valor: 1, nombre: 'Administrador' },
    { valor: 2, nombre: 'Supervisor' },
    { valor: 3, nombre: 'Asistente' },
  ];

  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = [
    'nIdUsuario',
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

  //#region Listar Puestos
  async fnListarUsuarios() {
    let pParametro = [];

    await this.usuariosService.LIS_Usuarios('01', pParametro, this.url).then(
      (value: any[]) => {
        console.log(value);

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
  async fnAbrirModal(accion) {
    const dialogRef = this.dialog.open(UsuariosModalComponent, {
      width: '50rem',
      disableClose: true,
      data: {
        accion: accion, //0:Nuevo , 1:Editar

      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('despues de cerrar');
      if (result !== undefined) {
        console.log(result);
      }
    });
  }
}
