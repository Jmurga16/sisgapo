import { EstadoRegistro } from './comun.model';

export interface CategoriaListado {
  nIdCategoria: number;
  sNombre: string;
  sDescripcion: string;
  sEstado: EstadoRegistro;
}

export interface CategoriaDetalle {
  nIdCategoria: number;
  sNombre: string;
  sDescripcion: string;
  bEstado: boolean;
}

export interface AlmacenCombo {
  nIdAlmacen: number;
  sNombreAlmacen: string;
}

export interface CategoriaCombo {
  nIdCategoria: number;
  sNombreCategoria: string;
}

// La fila resume los lotes del producto: existencia total, valor y el
// vencimiento más próximo. El detalle de cada partida está en LoteListado.
export interface ProductoListado {
  nIdCatProd: number;
  nIdAlmacen: number;
  sNombreAlmacen: string;
  nIdCategoria: number;
  sNombreCategoria: string;
  nIdProducto: number;
  sNombreProducto: string;
  nLotes: number;
  nCantidad: number;
  sNombreUM: string;
  nValor: number;
  dFechaVenc: string;
  sEstado: EstadoRegistro;
}

export interface UnidadMedidaCombo {
  nIdUnidadMedida: number;
  sNombreUM: string;
}

export interface ProductoDetalle {
  nIdCatProd: number;
  nIdAlmacen: number;
  nIdCategoria: number;
  nIdProducto: number;
  sNombreProducto: string;
}

// USP_MNT_Lotes, opción 01.
export interface LoteListado {
  nIdDetProd: number;
  nIdProducto: number;
  sNombreProducto: string;
  nIdAlmacen: number;
  sNombreAlmacen: string;
  nIdCategoria: number;
  sNombreCategoria: string;
  nIdLote: number;
  sNombreLote: string;
  dFechaFab: string;
  dFechaVenc: string;
  nDiasRestantes: number;
  nCantidad: number;
  sNombreUM: string;
  nPrecio: number;
  sEstado: EstadoRegistro;
}

// USP_MNT_Lotes, opción 02.
export interface LoteDetalle {
  nIdDetProd: number;
  nIdProducto: number;
  sNombreProducto: string;
  nIdLote: number;
  sNombreLote: string;
  dFechaFab: string;
  dFechaVenc: string;
  nIdUnidadMedida: number;
  nCantidad: number;
  nPrecio: number;
  sDescripcion: string;
  bEstado: boolean;
}

// USP_MNT_Lotes, opción 06.
export interface ProductoCombo {
  nIdProducto: number;
  sNombreProducto: string;
  nIdAlmacen: number;
  sNombreAlmacen: string;
}

// TBL_MOVIMIENTO.sTipo
export type TipoMovimiento = 'E' | 'S' | 'A';

// USP_MNT_Movimientos, opción 01.
export interface MovimientoListado {
  nIdMovimiento: number;
  nIdDetProd: number;
  dFechaMov: string;
  sTipo: TipoMovimiento;
  sTipoNombre: string;
  nEntrada: number;
  nSalida: number;
  nSaldo: number;
  sMotivo: string;
  sNombrePersona: string;
  sNombreLote: string;
  sNombreProducto: string;
  sNombreAlmacen: string;
  sNombreUM: string;
}

// USP_MNT_Movimientos, opción 03.
export interface LoteCombo {
  nIdDetProd: number;
  sNombreLote: string;
  nIdProducto: number;
  sNombreProducto: string;
  nIdAlmacen: number;
  sNombreAlmacen: string;
  nCantidad: number;
  sNombreUM: string;
  dFechaVenc: string;
}

// USP_MNT_Movimientos, opción 04.
export interface ResumenMovimientos {
  nMovimientos: number;
  nEntradas: number;
  nSalidas: number;
  nAjustes: number;
}
