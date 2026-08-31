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

export interface ProductoListado {
  nIdCatProd: number;
  nIdAlmacen: number;
  sNombreAlmacen: string;
  nIdCategoria: number;
  sNombreCategoria: string;
  nIdProducto: number;
  sNombreProducto: string;
  nIdDetProd: number;
  nCantidad: number;
  sNombreUM: string;
  nPrecio: number;
  sNombreLote: string;
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
  nIdDetProd: number;
  nCantidad: number;
  nIdUnidadMedida: number;
  nPrecio: number;
  sDescripcion: string;
  nIdLote: number;
  dFechaFab: string;
  dFechaVenc: string;
}
