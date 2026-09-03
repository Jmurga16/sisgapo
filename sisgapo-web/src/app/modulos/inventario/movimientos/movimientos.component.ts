import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import {
  AlmacenCombo,
  LoteCombo,
  MovimientoListado,
  ProductoCombo,
  ResumenMovimientos
} from 'src/app/shared/models';
import { APP_DATE_FORMATS, AppDateAdapter } from 'src/app/shared/services/AppDateAdapter';
import { InventarioService } from '../inventario.service';
import { MovimientosModalComponent } from './movimientos-modal/movimientos-modal.component';
import { ConfiguracionService } from 'src/app/shared/services/configuracion.service';
import { SesionService } from 'src/app/shared/services/sesion.service';

interface EventoFecha {
  value: Date;
}

@Component({
  selector: 'app-movimientos',
  templateUrl: './movimientos.component.html',
  styleUrls: ['./movimientos.component.css'],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
  ]
})
export class MovimientosComponent implements OnInit, AfterViewInit {
  readonly displayedColumns: string[] = [
    'dFechaMov',
    'sTipoNombre',
    'sNombreProducto',
    'sNombreLote',
    'sNombreAlmacen',
    'nEntrada',
    'nSalida',
    'nSaldo',
    'sMotivo',
    'sNombrePersona',
  ];

  listaAlmacenes: AlmacenCombo[] = [];
  listaProductos: ProductoCombo[] = [];
  listaLotes: LoteCombo[] = [];
  fAlmacen = new FormControl(0);
  fProducto = new FormControl(0);
  fLote = new FormControl(0);
  fTipo = new FormControl('');
  fDesde = new FormControl('');
  fHasta = new FormControl('');
  dDesde: string = '';
  dHasta: string = '';
  oResumen: ResumenMovimientos = { nMovimientos: 0, nEntradas: 0, nSalidas: 0, nAjustes: 0 };
  dsMovimiento = new MatTableDataSource<MovimientoListado>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private inventarioService: InventarioService,
    public configuracionService: ConfiguracionService,
    public sesionService: SesionService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    //Se llega aquí desde el botón "Kardex" del listado de lotes.
    const nIdDetProd = Number(this.route.snapshot.queryParamMap.get('lote'));

    if (nIdDetProd > 0) {
      this.fLote.setValue(nIdDetProd);
    }

    this.fnListarAlmacenes();
    this.fnListarProductos();
    this.fnListarLotes();
    this.fnListarMovimientos();
  }

  ngAfterViewInit(): void {
    this.dsMovimiento.paginator = this.paginator;
    this.dsMovimiento.sort = this.sort;
  }

  fnFiltrarTabla(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dsMovimiento.filter = filterValue.trim().toLowerCase();

    if (this.dsMovimiento.paginator) {
      this.dsMovimiento.paginator.firstPage();
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
      this.listaLotes = await this.inventarioService.fnServMovimiento<LoteCombo[]>(
        '03',
        [this.fAlmacen.value || 0, this.fProducto.value || 0]
      );
    } catch (error) {
      console.error(error as HttpErrorResponse);
    }
  }

  async fnListarMovimientos(): Promise<void> {
    const filtros = this.fnFiltros();

    try {
      this.dsMovimiento.data = await this.inventarioService
        .fnServMovimiento<MovimientoListado[]>('01', filtros);

      const resumen = await this.inventarioService
        .fnServMovimiento<ResumenMovimientos[]>('04', filtros);

      if (resumen.length) {
        this.oResumen = resumen[0];
      }
    } catch (error) {
      console.error(error as HttpErrorResponse);
    }
  }

  async fnCambiarAlmacen(): Promise<void> {
    this.fProducto.setValue(0);
    this.fLote.setValue(0);
    await this.fnListarProductos();
    await this.fnListarLotes();
    await this.fnListarMovimientos();
  }

  async fnCambiarProducto(): Promise<void> {
    this.fLote.setValue(0);
    await this.fnListarLotes();
    await this.fnListarMovimientos();
  }

  fnCambiarFecha(event: EventoFecha, nTipo: number): void {
    const fecha = this.fnFechaIso(event.value);

    if (nTipo === 1) {
      this.dDesde = fecha;
    } else if (nTipo === 2) {
      this.dHasta = fecha;
    }

    this.fnListarMovimientos();
  }

  fnCleanFilter(input?: HTMLInputElement): void {
    if (input) {
      input.value = '';
      this.dsMovimiento.filter = '';
    }

    this.fAlmacen.setValue(0);
    this.fProducto.setValue(0);
    this.fLote.setValue(0);
    this.fTipo.setValue('');
    this.fDesde.setValue('');
    this.fHasta.setValue('');
    this.dDesde = '';
    this.dHasta = '';
    this.fnListarProductos();
    this.fnListarLotes();
    this.fnListarMovimientos();
  }

  fnAbrirModal(): void {
    const dialogRef = this.dialog.open(MovimientosModalComponent, {
      width: '45rem',
      maxWidth: '95vw',
      disableClose: true,
      data: { nIdDetProd: this.fLote.value || 0 },
    });

    dialogRef.afterClosed().subscribe((result: number | undefined) => {
      if (result !== undefined) {
        this.fnListarLotes();
        this.fnListarMovimientos();
      }
    });
  }

  private fnFiltros(): (string | number)[] {
    return [
      this.fAlmacen.value || 0,
      this.fProducto.value || 0,
      this.fLote.value || 0,
      this.fTipo.value || '',
      this.dDesde,
      this.dHasta,
    ];
  }

  private fnFechaIso(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }
}
