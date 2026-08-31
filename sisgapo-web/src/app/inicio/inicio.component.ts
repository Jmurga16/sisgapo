import { Component, OnInit } from '@angular/core';
import {
  PanelPorAlmacen,
  PanelPorCategoria,
  PanelPorVencer,
  PanelResumen
} from 'src/app/shared/models';
import { PanelService } from './panel.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {
  bCargando: boolean = true;
  bError: boolean = false;
  oResumen: PanelResumen = {
    nAlmacenes: 0,
    nProductos: 0,
    nCategorias: 0,
    nZonas: 0,
    nValorInventario: 0,
    nUnidades: 0,
    nPorVencer30: 0,
    nVencidos: 0
  };

  lPorAlmacen: PanelPorAlmacen[] = [];
  lPorCategoria: PanelPorCategoria[] = [];
  lPorVencer: PanelPorVencer[] = [];
  nMaxAlmacen: number = 0;
  nMaxCategoria: number = 0;
  readonly nDiasVencimiento: number = 90;
  readonly columnasVencer: string[] = [
    'sNombreProducto',
    'sNombreAlmacen',
    'sNombreLote',
    'nCantidad',
    'dFechaVenc',
    'nDiasRestantes'
  ];

  constructor(private panelService: PanelService) { }

  ngOnInit(): void {
    this.fnCargarPanel();
  }

  async fnCargarPanel(): Promise<void> {
    this.bCargando = true;
    this.bError = false;

    try {
      await Promise.all([
        this.fnCargarResumen(),
        this.fnCargarPorAlmacen(),
        this.fnCargarPorCategoria(),
        this.fnCargarPorVencer()
      ]);
    } catch (error) {
      console.error(error);
      this.bError = true;
    } finally {
      this.bCargando = false;
    }
  }

  async fnCargarResumen(): Promise<void> {
    // Opción 01: devuelve una lista de una sola fila.
    const resumen = await this.panelService.fnServPanel<PanelResumen>('01', []);
    if (resumen.length) {
      this.oResumen = resumen[0];
    }
  }

  async fnCargarPorAlmacen(): Promise<void> {
    this.lPorAlmacen = await this.panelService.fnServPanel<PanelPorAlmacen>('02', []);
    this.nMaxAlmacen = this.fnMaximo(this.lPorAlmacen, 'nValor');
  }

  async fnCargarPorCategoria(): Promise<void> {
    this.lPorCategoria = await this.panelService.fnServPanel<PanelPorCategoria>('03', []);
    this.nMaxCategoria = this.fnMaximo(this.lPorCategoria, 'nValor');
  }

  async fnCargarPorVencer(): Promise<void> {
    this.lPorVencer = await this.panelService
      .fnServPanel<PanelPorVencer>('04', [this.nDiasVencimiento]);
  }

  fnMaximo<T>(lista: T[], sCampo: keyof T): number {
    return lista.length
      ? Math.max(...lista.map((item: T) => Number(item[sCampo]) || 0))
      : 0;
  }

  fnAncho(nValor: number, nMaximo: number): string {
    if (!nMaximo) {
      return '2%';
    }
    return Math.max(2, Math.round((Number(nValor) / nMaximo) * 100)) + '%';
  }

  fnClaseVencimiento(nDias: number): string {
    if (nDias <= 15) {
      return 'venc-critico';
    }
    if (nDias <= 30) {
      return 'venc-aviso';
    }
    return 'venc-normal';
  }
}
