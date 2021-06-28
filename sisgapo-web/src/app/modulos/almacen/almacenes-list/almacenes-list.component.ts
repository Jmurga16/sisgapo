import { Component, OnInit, ViewChild } from '@angular/core';
import { AlmacenesService } from '../almacenes.service';

import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-almacenes-list',
  templateUrl: './almacenes-list.component.html',
  styleUrls: ['./almacenes-list.component.css'],
})
export class AlmacenesListComponent implements OnInit {
  appName: string = 'Almacenes';
  usuarios: any = [];

  stocks: any[] = [
    { value: 1, viewValue: 'Todos' },
    { value: 2, viewValue: 'En Stock' },
    { value: 3, viewValue: 'Sin Stock' },
  ];

  libro: any = {
    Id_libro: 0,
    cDescripcion: '',
    cAsignatura: '',
    bStock: 1,
  };

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

  constructor(almacenesService: AlmacenesService) {
    this.dataSource = new MatTableDataSource();
  }

  ngOnInit(): void {}

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


}
