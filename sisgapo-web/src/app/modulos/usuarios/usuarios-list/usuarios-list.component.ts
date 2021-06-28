import { Component, OnInit, ViewChild } from '@angular/core';
import { UsuariosService } from '../usuarios.service';

import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-usuarios-list',
  templateUrl: './usuarios-list.component.html',
  styleUrls: ['./usuarios-list.component.css']
})
export class UsuariosListComponent implements OnInit {

  appName: string = 'Usuarios';
  usuarios:any=[];

  stocks:any [] = [
    { value: 1, viewValue: 'Todos' },
    { value: 2, viewValue: 'Activo' },
    { value: 3, viewValue: 'Inactivo' }
  ];


  libro:any={
    Id_libro:0,
    cDescripcion:'',
    cAsignatura:'',
    bStock: 1
  }
  
  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = ['nIdUsuario', 'sNombreUsuario', 'sNombreRol', 'sEstado', 'Acciones'];
  
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(private usuariosService: UsuariosService) { }

  ngOnInit(): void {

    
  }

}
