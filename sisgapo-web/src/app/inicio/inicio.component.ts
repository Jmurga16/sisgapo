import { Component, OnInit } from '@angular/core';
import { PanelService } from './panel.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {

  //#region Variables
  bCargando: boolean = true;
  bError: boolean = false;

  oResumen: any = {
    nAlmacenes: 0,
    nProductos: 0,
    nCategorias: 0,
    nZonas: 0,
    nValorInventario: 0,
    nUnidades: 0,
    nPorVencer30: 0,
    nVencidos: 0
  };

  lPorAlmacen: any[] = [];
  lPorCategoria: any[] = [];
  lPorVencer: any[] = [];

  //Referencias para dibujar las barras en proporción al mayor valor
  nMaxAlmacen: number = 0;
  nMaxCategoria: number = 0;

  columnasVencer: string[] = [
    'sNombreProducto',
    'sNombreAlmacen',
    'sNombreLote',
    'nCantidad',
    'dFechaVenc',
    'nDiasRestantes'
  ];
  //#endregion


  constructor(private panelService: PanelService) { }


  ngOnInit(): void {
    this.fnCargarPanel();
  }


  //#region Cargar panel
  async fnCargarPanel() {
    this.bCargando = true;
    this.bError = false;

    try {
      await Promise.all([
        this.fnCargarResumen(),
        this.fnCargarPorAlmacen(),
        this.fnCargarPorCategoria(),
        this.fnCargarPorVencer()
      ]);
    }
    catch (error) {
      console.error(error);
      this.bError = true;
    }
    finally {
      this.bCargando = false;
    }
  }
  //#endregion


  //#region Tarjetas de resumen
  async fnCargarResumen() {
    const value: any = await this.panelService.fnServPanel('01', []);

    if (value && value.length > 0) {
      this.oResumen = value[0];
    }
  }
  //#endregion


  //#region Existencias por almacén
  async fnCargarPorAlmacen() {
    const value: any = await this.panelService.fnServPanel('02', []);

    this.lPorAlmacen = value || [];
    this.nMaxAlmacen = this.fnMaximo(this.lPorAlmacen, 'nValor');
  }
  //#endregion


  //#region Existencias por categoría
  async fnCargarPorCategoria() {
    const value: any = await this.panelService.fnServPanel('03', []);

    this.lPorCategoria = value || [];
    this.nMaxCategoria = this.fnMaximo(this.lPorCategoria, 'nValor');
  }
  //#endregion


  //#region Próximos a vencer (90 días)
  async fnCargarPorVencer() {
    const value: any = await this.panelService.fnServPanel('04', [90]);

    this.lPorVencer = value || [];
  }
  //#endregion


  //#region Utilidades de presentación
  fnMaximo(lista: any[], sCampo: string): number {
    if (!lista || lista.length === 0) {
      return 0;
    }
    return Math.max(...lista.map(item => Number(item[sCampo]) || 0));
  }

  //Ancho de la barra en porcentaje. Un mínimo del 2% para que una fila con
  //valor cero siga siendo visible como fila.
  fnAncho(nValor: number, nMaximo: number): string {
    if (!nMaximo) {
      return '2%';
    }
    return Math.max(2, Math.round((Number(nValor) / nMaximo) * 100)) + '%';
  }

  //Semáforo de vencimiento: rojo <= 15 días, ámbar <= 30, normal por encima.
  fnClaseVencimiento(nDias: number): string {
    if (nDias <= 15) {
      return 'venc-critico';
    }
    if (nDias <= 30) {
      return 'venc-aviso';
    }
    return 'venc-normal';
  }
  //#endregion

}
