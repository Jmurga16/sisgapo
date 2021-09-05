import { Component, OnInit, ViewChild } from '@angular/core';
import { InventarioService } from '../inventario.service';
import { ProductosModalComponent } from './productos-modal/productos-modal.component'

import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import Swal from "sweetalert2";
import { FormControl } from '@angular/forms';


@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {

  nIdUsuario: number;
  listaAlmacenes=[]
  listaCategorias=[]
  fAlmacen=new FormControl();
  fCategoria=new FormControl();


  dsProducto: MatTableDataSource<any>;

  displayedColumns: string[] = [
    'nIdCatProd',   
    'sNombreAlmacen',
    'sNombreCategoria',
    'sNombreProducto',
    'nCantidad',
    'sNombreUM',
    'nPrecio',   
    'dFechaVenc',
    'sEstado',
    'Acciones',
  ];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private inventarioService: InventarioService,
    public dialog: MatDialog,
    ) { 
      this.dsProducto = new MatTableDataSource();
      
    }

  ngOnInit(): void {
   
    this.fnListarAlmacenes();
    this.fnListarCategorias();
    this.fnListarProductos()
  }

 
  //#region Filtro
  fnFiltrarTabla(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dsProducto.filter = filterValue.trim().toLowerCase();

    if (this.dsProducto.paginator) {
      this.dsProducto.paginator.firstPage();
    }
  }
  //#endregion


   //#region Listar Almacenes
   async fnListarAlmacenes() {
    let pParametro = [];

    await this.inventarioService.fnServProducto('01', pParametro).then(
      (value: any[]) => {

        this.listaAlmacenes=value;
        
      },
      (error) => {
        console.log(error);
      }
    );
  }
  //#endregion


   //#region Listar Categorias
   async fnListarCategorias() {
    let pParametro = [];

    await this.inventarioService.fnServProducto('02', pParametro).then(
      (value: any[]) => {

        this.listaCategorias=value;

      },
      (error) => {
        console.log(error);
      }
    );
  }
  //#endregion


  //#region Listar Productos(Tabla)
  async fnListarProductos() {
    let pParametro = [];

    await this.inventarioService.fnServProducto('03', pParametro).then(
      (value: any[]) => {

        this.dsProducto = new MatTableDataSource(value);
        this.dsProducto.paginator = this.paginator;
        this.dsProducto.sort = this.sort;
      },
      (error) => {
        console.log(error);
      }
    );
  }
  //#endregion


  //#region Limpiar Filtros
  fnCleanFilter(){
    this.fAlmacen.setValue('')
    this.fCategoria.setValue('')
    this.fnListarProductos();
  }
  //#endregion


  //#region Abrir Modal
  async fnAbrirModal(accion, nIdCatProd) {
    const dialogRef = this.dialog.open(ProductosModalComponent, {
      width: '50rem',
      disableClose: true,
      data: {
        accion: accion, //0:Nuevo , 1:Editar
        nIdCatProd: nIdCatProd
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        this.fnListarProductos();
      }
    });
  }
  //#endregion


  //#region Eliminar/Activar
  async fnCambiarEstado(nIdCatProd, bEstado) {

    let sTitulo, sRespuesta;

    if (bEstado == 0) {
      sTitulo = '¿Desea eliminar el Producto?'
      sRespuesta = 'Se eliminó el Producto con éxito'
    }
    else {
      sTitulo = '¿Desea activar el Producto?'
      sRespuesta = 'Se activó el Producto con éxito'
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

    pParametro.push(nIdCatProd);
    pParametro.push(bEstado);

    await this.inventarioService.fnServProducto('08', pParametro).then(
      (value: any) => {

        if (value.cod == 1) {
          Swal.fire({
            title: sRespuesta,
            icon: 'success',
            timer: 3500
          })
        }

        this.fnListarProductos();

      },
      (error) => {
        console.log(error);
      }
    );
  }
  //#endregion



}

export interface ProductoData {
  accion: number;
  nIdCatProd:number;
}