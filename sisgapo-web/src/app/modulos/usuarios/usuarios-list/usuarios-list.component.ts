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
    { value: 2, viewValue: 'En Stock' },
    { value: 3, viewValue: 'Sin Stock' }
  ];


  libro:any={
    Id_libro:0,
    cDescripcion:'',
    cAsignatura:'',
    bStock: 1
  }
  
  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = ['Id_libro', 'descripcion', 'asignatura', 'stock', 'Acciones'];
  
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(private usuariosService: UsuariosService) { }

  ngOnInit(): void {
  }

}
