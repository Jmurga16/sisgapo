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

  //#region Variables
  url: string;
  nIdUsuario: number;
  appName: string;
  dsAlmacenes: MatTableDataSource<any>;
  displayedColumns: string[] = [
    'nIdAlmacen',
    'sNombreZona',
    'sNombreAlmacen',
    'sEstado',
    'Acciones',
  ];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  //#endregion

  
  //#region Constructor
  constructor(
    private almacenesService: AlmacenesService,
    public dialog: MatDialog,
  ) {
    //Definicion de Titulo
    this.appName = 'Almacenes';
    //Inicializar Tabla
    this.dsAlmacenes = new MatTableDataSource();
    //Definicion URL
    this.url = 'https://localhost:44360/';
  }
  //#endregion


  //#region Iniciar
  ngOnInit(): void {
    this.fnListarAlmacenes();
  }
  //#endregion


  //#region Filtrado de Almacenes
  applyFilter(event: Event) {
    //Leer el filtro
    const filterValue = (event.target as HTMLInputElement).value;
    this.dsAlmacenes.filter = filterValue.trim().toLowerCase();

    //Si hay paginacion
    if (this.dsAlmacenes.paginator) {
      this.dsAlmacenes.paginator.firstPage();
    }
  }
  //#endregion


  //#region Abrir Modal
  async fnAbrirModal(accion, nIdAlmacen) {
    //Constante para abrir el modal
    const dialogRef = this.dialog.open(AlmacenesModalComponent, {
      width: '50rem',
      disableClose: true,
      data: {
        accion: accion, //0:Nuevo , 1:Editar
        nIdAlmacen: nIdAlmacen
      },
    });
    //Luego de Cerrar el modal
    dialogRef.afterClosed().subscribe((result) => {
      //Si el result al cerrar modal es diferente de indefinido
      if (result !== undefined) {
        //Se lista los almacenes nuevamente
        this.fnListarAlmacenes();
      }
    });
  }
  //#endregion Abrir Modal


  //#region Listar Almacenes
  async fnListarAlmacenes() {
    let pParametro = [];
    //Llamar al servicio para listar todos los almacenes
    await this.almacenesService.fnServAlmacenes('01', pParametro, this.url).then(
      (value: any[]) => {
        //Listar todos los almacenes en la tabla
        this.dsAlmacenes = new MatTableDataSource(value);
        this.dsAlmacenes.paginator = this.paginator;
        this.dsAlmacenes.sort = this.sort;
      },
      (error) => {
        console.log(error);
      }
    );
  }
  //#endregion Listar Almacenes


  //#region Cambiar Estado
  async fnCambiarEstado(nIdUsuario, bEstado) {
    let sTitulo, sRespuesta;

    //Asignar Titulo de Mensaje 
    sTitulo = bEstado == 0 ? '¿Desea eliminar el almacén?' : '¿Desea activar el almacén?'
    //Asignar Respuesta segun cambio
    sRespuesta = bEstado == 0 ? 'Se eliminó el almacén con éxito' : 'Se activó el almacén con éxito'

    //Mensaje de confirmacion
    var resp = await Swal.fire({
      title: sTitulo,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    })

    //Si se responde no
    if (!resp.isConfirmed) {
      return;
    }

    //Definicion parametros
    let pParametro = [];
    //Dar parametros
    //Identificador de Usuario
    pParametro.push(nIdUsuario);
    //Estado a cambiar
    pParametro.push(bEstado);

    //Llamar al servicio de almacenes para cambiar estado : 07
    await this.almacenesService.fnServAlmacenes('07', pParametro, this.url).then(
      (data: any) => {
        //Si la respuesta de la bbdd es 'ok' entonces procede
        if (data.mensaje == "Ok") {
          Swal.fire({
            title: sRespuesta,
            icon: 'success',
            timer: 3500
          })
        }
        //Se lista nuevamente los almacenes
        this.fnListarAlmacenes();
      },
      (error) => {
        //Mensaje en caso de error(solo consola)
        console.log(error);
      }
    );
  }
  //#endregion Eliminar/Activar


  //#region Despues de la vista de inicio
  ngAfterViewInit() {
    //Paginar y Ordenar
    this.dsAlmacenes.paginator = this.paginator;
    this.dsAlmacenes.sort = this.sort;
  }
  //#endregion

}