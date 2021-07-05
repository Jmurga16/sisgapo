import { Component, OnInit, ViewChild } from '@angular/core';
import { AlmacenesService } from '../almacenes.service';
import { AlmacenesModalComponent } from './../almacenes-modal/almacenes-modal.component'

import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import Swal from "sweetalert2";


@Component({
  selector: 'app-almacenes-list',
  templateUrl: './almacenes-list.component.html',
  styleUrls: ['./almacenes-list.component.css'],
})
export class AlmacenesListComponent implements OnInit {

  url: string;
  nIdUsuario: number;
  appName: string;

  dataSource: MatTableDataSource<any>;

  displayedColumns: string[] = [
    'nIdAlmacen',
    'sNombreZona',
    'sNombreAlmacen',
    'sEstado',
    'Acciones',
  ];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private almacenesService: AlmacenesService,
    public dialog: MatDialog,
  ) {
    this.appName = 'Almacenes';
    this.dataSource = new MatTableDataSource();
    this.url = 'https://localhost:44360/';
  }

  ngOnInit(): void {
    
    this.fnListarAlmacenes();

  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }


  //#region Listar Usuarios
  async fnListarAlmacenes() {
    let pParametro = [];

    await this.almacenesService.fnServAlmacenes('01', pParametro, this.url).then(
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
  async fnAbrirModal(accion, nIdAlmacen) {
    const dialogRef = this.dialog.open(AlmacenesModalComponent, {
      width: '50rem',
      disableClose: true,
      data: {
        accion: accion, //0:Nuevo , 1:Editar
        nIdAlmacen: nIdAlmacen
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        this.fnListarAlmacenes();
      }
    });
  }
  //#endregion


  //#region Eliminar/Activar
  async fnCambiarEstado(nIdUsuario, bEstado) {

    let sTitulo, sRespuesta;

    if (bEstado == 0) {
      sTitulo = '¿Desea eliminar el almacén?'
      sRespuesta = 'Se eliminó el almacén con éxito'
    }
    else {
      sTitulo = '¿Desea activar el almacén?'
      sRespuesta = 'Se activó el almacén con éxito'
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

    await this.almacenesService.fnServAlmacenes('07', pParametro, this.url).then(
      (value: any) => {

        if (value.mensaje = "Ok") {
          Swal.fire({
            title: sRespuesta,
            icon: 'success',
            timer: 3500
          })
        }
        this.fnListarAlmacenes();

      },
      (error) => {
        console.log(error);
      }
    );
  }
  //#endregion

}



