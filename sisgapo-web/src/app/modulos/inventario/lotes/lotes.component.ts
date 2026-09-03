import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import {
  AccionModal,
  AlmacenCombo,
  CategoriaCombo,
  DatosModal,
  LoteListado,
  ProductoCombo,
  RespuestaApi,
  ValorEstado
} from 'src/app/shared/models';
import { InventarioService } from '../inventario.service';
import { LotesModalComponent } from './lotes-modal/lotes-modal.component';
import { ConfiguracionService } from 'src/app/shared/services/configuracion.service';
import { SesionService } from 'src/app/shared/services/sesion.service';

@Component({
  selector: 'app-lotes',
  templateUrl: './lotes.component.html',
  styleUrls: ['./lotes.component.css']
})
export class LotesComponent implements OnInit, AfterViewInit {
  readonly displayedColumns: string[] = [
    'sNombreLote',
    'sNombreProducto',
    'sNombreAlmacen',
    'sNombreCategoria',
    'nCantidad',
    'sNombreUM',
    'nPrecio',
    'dFechaVenc',
    'sEstado',
    'Acciones',
  ];

  listaAlmacenes: AlmacenCombo[] = [];
  listaCategorias: CategoriaCombo[] = [];
  listaProductos: ProductoCombo[] = [];
  fAlmacen = new FormControl(0);
  fCategoria = new FormControl(0);
  fProducto = new FormControl(0);
  dsLote = new MatTableDataSource<LoteListado>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private inventarioService: InventarioService,
    public configuracionService: ConfiguracionService,
    public sesionService: SesionService,
    public dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    //Se llega aquí desde el botón "Lotes" del listado de productos.
    const nIdProducto = Number(this.route.snapshot.queryParamMap.get('producto'));

    if (nIdProducto > 0) {
      this.fProducto.setValue(nIdProducto);
    }

    this.fnListarAlmacenes();
    this.fnListarCategorias();
    this.fnListarProductos();
    this.fnListarLotes();
  }

  ngAfterViewInit(): void {
    this.dsLote.paginator = this.paginator;
    this.dsLote.sort = this.sort;
  }

  fnFiltrarTabla(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dsLote.filter = filterValue.trim().toLowerCase();

    if (this.dsLote.paginator) {
      this.dsLote.paginator.firstPage();
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
      this.listaProductos = await this.inventarioService
        .fnServLote<ProductoCombo[]>('06', [this.fAlmacen.value || 0]);
    } catch (error) {
      console.error(error as HttpErrorResponse);
    }
  }

  async fnListarLotes(): Promise<void> {
    try {
      this.dsLote.data = await this.inventarioService.fnServLote<LoteListado[]>(
        '01',
        [this.fAlmacen.value || 0, this.fCategoria.value || 0, this.fProducto.value || 0]
      );
    } catch (error) {
      console.error(error as HttpErrorResponse);
    }
  }

  //Al cambiar de almacén el producto elegido puede no estar en él.
  async fnCambiarAlmacen(): Promise<void> {
    this.fProducto.setValue(0);
    await this.fnListarProductos();
    await this.fnListarLotes();
  }

  fnCleanFilter(input?: HTMLInputElement): void {
    if (input) {
      input.value = '';
      this.dsLote.filter = '';
    }

    this.fAlmacen.setValue(0);
    this.fCategoria.setValue(0);
    this.fProducto.setValue(0);
    this.fnListarProductos();
    this.fnListarLotes();
  }

  fnEtiquetaVencimiento(lote: LoteListado): string {
    return lote.nDiasRestantes < 0 ? 'vencido' : `${lote.nDiasRestantes} d`;
  }

  fnVerKardex(nIdDetProd: number): void {
    this.router.navigate(['/movimientos'], { queryParams: { lote: nIdDetProd } });
  }

  fnAbrirModal(accion: AccionModal, nIdDetProd: number): void {
    const datos: DatosModal = { accion, nId: nIdDetProd };
    const dialogRef = this.dialog.open(LotesModalComponent, {
      width: '50rem',
      maxWidth: '95vw',
      disableClose: true,
      data: datos,
    });

    dialogRef.afterClosed().subscribe((result: number | undefined) => {
      if (result !== undefined) {
        this.fnListarLotes();
      }
    });
  }

  async fnCambiarEstado(nIdDetProd: number, estado: ValorEstado): Promise<void> {
    const activar = estado === ValorEstado.Activo;
    const confirmacion = await Swal.fire({
      title: activar ? '¿Desea activar el lote?' : '¿Desea dar de baja el lote?',
      text: activar ? '' : 'Solo se puede dar de baja un lote sin existencia.',
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
      const respuesta = await this.inventarioService.fnServLote<RespuestaApi>(
        '05',
        [nIdDetProd, estado]
      );

      if (respuesta.cod === '1') {
        await Swal.fire({ title: respuesta.mensaje, icon: 'success', timer: 3500 });
      } else {
        await Swal.fire({ title: 'No se pudo cambiar el estado', text: respuesta.mensaje, icon: 'error' });
      }

      await this.fnListarLotes();
    } catch (error) {
      console.error(error as HttpErrorResponse);
    }
  }
}
