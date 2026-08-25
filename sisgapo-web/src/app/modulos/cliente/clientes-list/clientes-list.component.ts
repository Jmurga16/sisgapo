import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { ClientesService } from '../clientes.service';
import { ClientesModalComponent } from './../clientes-modal/clientes-modal.component'
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import Swal from "sweetalert2";

@Component({
  selector: 'app-clientes-list',
  templateUrl: './clientes-list.component.html',
  styleUrls: ['./clientes-list.component.css']
})
export class ClientesListComponent implements OnInit {

  //#region Variables
  nIdUsuario: number;
  appName: string;
  dsClientes: MatTableDataSource<any>;
  displayedColumns: string[] = [
    'nIdCliente',
    'sNombre',
    'sEmail',
    'nTelefono',
    'sDireccion',
    'sDescripcion',
    'Acciones'
  ];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  //#endregion

  constructor(
    private clientesService: ClientesService,
    public dialog: MatDialog
  ) { 
    this.dsClientes = new MatTableDataSource();
  }

  ngOnInit(): void {
    this.fnListarClientes();
  }

  //#region Filtrado de Clientes
  applyFilter(event: Event) {
    //Leer el filtro
    const filterValue = (event.target as HTMLInputElement).value;
    this.dsClientes.filter = filterValue.trim().toLowerCase();

    //Si hay paginacion
    if (this.dsClientes.paginator) {
      this.dsClientes.paginator.firstPage();
    }
  }
  //#endregion


  //#region Abrir Modal
  async fnAbrirModal(accion, nIdCliente) {
    //Constante para abrir el modal
    const dialogRef = this.dialog.open(ClientesModalComponent, {
      width: '30rem',
      disableClose: true,
      data: {
        accion: accion, //0:Nuevo , 1:Editar
        nIdCliente: nIdCliente
      },
    });
    //Luego de Cerrar el modal
    dialogRef.afterClosed().subscribe((result) => {
      //Si el result al cerrar modal es diferente de indefinido
      if (result !== undefined) {
        //Se lista los clientes nuevamente
        this.fnListarClientes();
      }
    });
  }
  //#endregion Abrir Modal


  //#region Listar Clientes
  async fnListarClientes() {
    let pParametro = [];
    //Llamar al servicio para listar todos los clientes
    await this.clientesService.fnServClientes('01', pParametro).then(
      (value: any[]) => {
        //Listar todos los clientes en la tabla
        this.dsClientes = new MatTableDataSource(value);
        this.dsClientes.paginator = this.paginator;
        this.dsClientes.sort = this.sort;
      },
      (error) => {
        console.log(error);
      }
    );
  }
  //#endregion Listar Clientes


  //#region Despues de la vista de inicio
  ngAfterViewInit() {
    //Paginar y Ordenar
    this.dsClientes.paginator = this.paginator;
    this.dsClientes.sort = this.sort;
  }
  //#endregion

}
