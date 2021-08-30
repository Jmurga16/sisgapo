import { Component, OnInit, ViewChild } from '@angular/core';
import { InventarioService } from '../inventario.service';
import { CategoriaModalComponent } from './categoria-modal/categoria-modal.component'

import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import Swal from "sweetalert2";

@Component({
  selector: 'app-categoria',
  templateUrl: './categoria.component.html',
  styleUrls: ['./categoria.component.css']
})
export class CategoriaComponent implements OnInit {

  url: string;
  nIdUsuario: number;


  dsCategoria: MatTableDataSource<any>;

  displayedColumns: string[] = [
    'nIdCategoria',
    'sNombre',
    'sDescripcion',
    'sEstado',
    'Acciones',
  ];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;


  constructor(
    private inventarioService: InventarioService,
    public dialog: MatDialog,
  ) {
    this.dsCategoria = new MatTableDataSource();
    this.url = 'https://localhost:44360/';
  }

  ngOnInit(): void {

    this.fnListarCategorias()

  }

  ngAfterViewInit() {
    this.dsCategoria.paginator = this.paginator;
    this.dsCategoria.sort = this.sort;
  }

  //#region Filtro
  fnFiltrarTabla(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dsCategoria.filter = filterValue.trim().toLowerCase();

    if (this.dsCategoria.paginator) {
      this.dsCategoria.paginator.firstPage();
    }
  }
  //#endregion


  //#region Listar Usuarios
  async fnListarCategorias() {
    let pParametro = [];

    await this.inventarioService.fnServCategoria('01', pParametro, this.url).then(
      (value: any[]) => {

        this.dsCategoria = new MatTableDataSource(value);
        this.dsCategoria.paginator = this.paginator;
        this.dsCategoria.sort = this.sort;
      },
      (error) => {
        console.log(error);
      }
    );
  }
  //#endregion


  //#region Eliminar/Activar
  async fnCambiarEstado(nIdUsuario, bEstado) {

    let sTitulo, sRespuesta;

    if (bEstado == 0) {
      sTitulo = '¿Desea eliminar la categoría?'
      sRespuesta = 'Se eliminó la categoría con éxito'
    }
    else {
      sTitulo = '¿Desea activar la categoría?'
      sRespuesta = 'Se activó la categoría con éxito'
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

    await this.inventarioService.fnServCategoria('05', pParametro, this.url).then(
      (value: any) => {

        if (value.mensaje == "Ok") {
          Swal.fire({
            title: sRespuesta,
            icon: 'success',
            timer: 3500
          })
        }

        this.fnListarCategorias();

      },
      (error) => {
        console.log(error);
      }
    );
  }
  //#endregion


  //#region Abrir Modal
  async fnAbrirModal(accion, nIdCategoria) {
    const dialogRef = this.dialog.open(CategoriaModalComponent, {
      width: '50rem',
      disableClose: true,
      data: {
        accion: accion, //0:Nuevo , 1:Editar
        nIdCategoria: nIdCategoria
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        this.fnListarCategorias();
      }
    });
  }
  //#endregion

  
}
