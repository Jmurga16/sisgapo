import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import {
  AccionModal,
  AlmacenCombo,
  CategoriaCombo,
  DatosModal,
  ProductoListado,
  RespuestaApi,
  ValorEstado
} from 'src/app/shared/models';
import { InventarioService } from '../inventario.service';
import { ProductosModalComponent } from './productos-modal/productos-modal.component';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit, AfterViewInit {
  readonly displayedColumns: string[] = [
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

  listaAlmacenes: AlmacenCombo[] = [];
  listaCategorias: CategoriaCombo[] = [];
  fAlmacen = new FormControl(0);
  fCategoria = new FormControl(0);
  dsProducto = new MatTableDataSource<ProductoListado>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private inventarioService: InventarioService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.fnListarAlmacenes();
    this.fnListarCategorias();
    this.fnListarProductos();
  }

  ngAfterViewInit(): void {
    this.dsProducto.paginator = this.paginator;
    this.dsProducto.sort = this.sort;
  }

  fnFiltrarTabla(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dsProducto.filter = filterValue.trim().toLowerCase();

    if (this.dsProducto.paginator) {
      this.dsProducto.paginator.firstPage();
    }
  }

  async fnListarAlmacenes(): Promise<void> {
    try {
      this.listaAlmacenes = await this.inventarioService
        .fnServProducto<AlmacenCombo[]>('01', []);
    } catch (error) {
      console.error(error as HttpErrorResponse);
    }
  }

  async fnListarCategorias(): Promise<void> {
    try {
      this.listaCategorias = await this.inventarioService
        .fnServProducto<CategoriaCombo[]>('02', []);
    } catch (error) {
      console.error(error as HttpErrorResponse);
    }
  }

  async fnListarProductos(): Promise<void> {
    try {
      this.dsProducto.data = await this.inventarioService.fnServProducto<ProductoListado[]>(
        '03',
        [this.fAlmacen.value || 0, this.fCategoria.value || 0]
      );
    } catch (error) {
      console.error(error as HttpErrorResponse);
    }
  }

  fnCleanFilter(input?: HTMLInputElement): void {
    if (input) {
      input.value = '';
      this.dsProducto.filter = '';
    }

    this.fAlmacen.setValue(0);
    this.fCategoria.setValue(0);
    this.fnListarProductos();
  }

  fnAbrirModal(accion: AccionModal, nIdCatProd: number): void {
    const datos: DatosModal = { accion, nId: nIdCatProd };
    const dialogRef = this.dialog.open(ProductosModalComponent, {
      width: '50rem',
      maxWidth: '95vw',
      disableClose: true,
      data: datos,
    });

    dialogRef.afterClosed().subscribe((result: number | undefined) => {
      if (result !== undefined) {
        this.fnListarProductos();
      }
    });
  }

  async fnCambiarEstado(nIdProducto: number, estado: ValorEstado): Promise<void> {
    const activar = estado === ValorEstado.Activo;
    const confirmacion = await Swal.fire({
      title: activar ? '¿Desea activar el producto?' : '¿Desea desactivar el producto?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    try {
      const respuesta = await this.inventarioService.fnServProducto<RespuestaApi>(
        '08',
        [nIdProducto, estado]
      );

      if (respuesta.cod === '1') {
        const mensaje = activar
          ? 'Se activó el producto con éxito'
          : 'Se desactivó el producto con éxito';
        await Swal.fire({ title: mensaje, icon: 'success', timer: 3500 });
      } else {
        await Swal.fire({ title: 'No se pudo cambiar el estado', text: respuesta.mensaje, icon: 'error' });
      }

      await this.fnListarProductos();
    } catch (error) {
      console.error(error as HttpErrorResponse);
    }
  }
}
