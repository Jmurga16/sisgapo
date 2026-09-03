import { MediaMatcher } from '@angular/cdk/layout';
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
  ResumenMovimientos,
  TipoMovimiento
} from 'src/app/shared/models';
import { APP_DATE_FORMATS, AppDateAdapter } from 'src/app/shared/services/AppDateAdapter';
import { InventarioService } from '../inventario.service';
import { MovimientosModalComponent } from './movimientos-modal/movimientos-modal.component';
import { ConfiguracionService } from 'src/app/shared/services/configuracion.service';
import { SesionService } from 'src/app/shared/services/sesion.service';

interface EventoFecha {
  value: Date;
}


type VistaKardex = 'lista' | 'cronologia';


interface MovimientoKardex extends MovimientoListado {
  sHora: string;
}

interface DiaKardex {
  sFecha: string;
  sEtiqueta: string;
  nEntradas: number;
  nSalidas: number;
  lMovimientos: MovimientoKardex[];
}

const DIAS_SEMANA = [
  'domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'
];

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'
];

const DIAS_POR_TANDA = 10;

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
  sVista: VistaKardex = 'lista';
  lDias: DiaKardex[] = [];
  nDiasVisibles: number = DIAS_POR_TANDA;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private inventarioService: InventarioService,
    public configuracionService: ConfiguracionService,
    public sesionService: SesionService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private media: MediaMatcher,
  ) { }

  ngOnInit(): void {
    //La tabla tiene diez columnas: en pantalla estrecha se entra por la cronología.
    if (this.media.matchMedia('(max-width: 768px)').matches) {
      this.sVista = 'cronologia';
    }

    //Se llega aquí desde el botón "Kardex" del listado de lotes.
    const nIdDetProd = Number(this.route.snapshot.queryParamMap.get('lote'));

    if (nIdDetProd > 0) {
      this.fLote.setValue(nIdDetProd);
      //Quien pulsa "Kardex" quiere el recorrido del lote, no la tabla general.
      this.sVista = 'cronologia';
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

    this.fnAgruparPorDia();
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

      this.fnAgruparPorDia();

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

  //Rótulo de la cronología: si el filtro apunta a un solo lote, es su kardex.
  get sTituloKardex(): string {
    const nIdDetProd = Number(this.fLote.value);
    const lote = this.listaLotes.filter(opc => opc.nIdDetProd === nIdDetProd)[0];

    return lote
      ? `Kardex del lote ${lote.sNombreLote} · ${lote.sNombreProducto}`
      : 'Kardex de todos los lotes';
  }

  get lDiasVisibles(): DiaKardex[] {
    return this.lDias.slice(0, this.nDiasVisibles);
  }

  get bHayMasDias(): boolean {
    return this.lDias.length > this.nDiasVisibles;
  }

  get nMovimientosVisibles(): number {
    return this.lDiasVisibles.reduce((nTotal, dia) => nTotal + dia.lMovimientos.length, 0);
  }

  fnVerMasDias(): void {
    this.nDiasVisibles += DIAS_POR_TANDA;
  }

  fnClaseTipo(sTipo: TipoMovimiento): string {
    if (sTipo === 'E') {
      return 'tipo-entrada';
    }

    return sTipo === 'S' ? 'tipo-salida' : 'tipo-ajuste';
  }

  fnIconoTipo(sTipo: TipoMovimiento): string {
    if (sTipo === 'E') {
      return 'arrow_downward';
    }

    return sTipo === 'S' ? 'arrow_upward' : 'tune';
  }

  fnCantidadFirmada(mov: MovimientoKardex): string {
    return mov.nEntrada > 0 ? `+${mov.nEntrada}` : `-${mov.nSalida}`;
  }

  fnAbrirModal(): void {
    const dialogRef = this.dialog.open(MovimientosModalComponent, {
      width: '50rem',
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

  private fnAgruparPorDia(): void {
    const oDias: { [sFecha: string]: DiaKardex } = {};
    const lFechas: string[] = [];

    this.dsMovimiento.filteredData.forEach(mov => {
      const sFecha = (mov.dFechaMov || '').substring(0, 10);

      if (!oDias[sFecha]) {
        oDias[sFecha] = {
          sFecha,
          sEtiqueta: this.fnEtiquetaFecha(sFecha),
          nEntradas: 0,
          nSalidas: 0,
          lMovimientos: []
        };
        lFechas.push(sFecha);
      }

      oDias[sFecha].nEntradas += mov.nEntrada;
      oDias[sFecha].nSalidas += mov.nSalida;
      oDias[sFecha].lMovimientos.push({ ...mov, sHora: (mov.dFechaMov || '').substring(11, 16) });
    });

    //Descendente: el movimiento más reciente arriba, como en la tabla.
    this.lDias = lFechas.sort().reverse().map(sFecha => oDias[sFecha]);
    this.nDiasVisibles = DIAS_POR_TANDA;
  }

  private fnEtiquetaFecha(sFecha: string): string {
    const partes = sFecha.split('-');

    if (partes.length < 3) {
      return sFecha;
    }

    const fecha = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
    const sEtiqueta = `${DIAS_SEMANA[fecha.getDay()]} ${fecha.getDate()} de ${MESES[fecha.getMonth()]} de ${fecha.getFullYear()}`;

    const hoy = new Date();
    const sHoy = this.fnFechaIso(hoy);
    const sAyer = this.fnFechaIso(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 1));

    if (sFecha === sHoy) {
      return `Hoy · ${sEtiqueta}`;
    }

    if (sFecha === sAyer) {
      return `Ayer · ${sEtiqueta}`;
    }

    return sEtiqueta;
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
