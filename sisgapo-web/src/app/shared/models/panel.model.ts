export interface PanelResumen {
  nAlmacenes: number;
  nProductos: number;
  nCategorias: number;
  nZonas: number;
  nValorInventario: number;
  nUnidades: number;
  nPorVencer30: number;
  nVencidos: number;
}

export interface PanelPorAlmacen {
  nIdAlmacen: number;
  sNombreAlmacen: string;
  sNombreZona: string;
  nProductos: number;
  nUnidades: number;
  nValor: number;
}

export interface PanelPorCategoria {
  nIdCategoria: number;
  sNombreCategoria: string;
  nProductos: number;
  nUnidades: number;
  nValor: number;
}

export interface PanelPorVencer {
  nIdCatProd: number;
  nIdProducto: number;
  sNombreProducto: string;
  sNombreAlmacen: string;
  sNombreCategoria: string;
  sNombreLote: string;
  dFechaVenc: string;
  nDiasRestantes: number;
  nCantidad: number;
  sNombreUM: string;
}
