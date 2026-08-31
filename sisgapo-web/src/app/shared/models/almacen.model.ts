import { EstadoRegistro } from './comun.model';

// USP_MNT_Almacenes, opción 01.
export interface AlmacenListado {
  nIdAlmacen: number;
  sNombreZona: string;
  sNombreAlmacen: string;
  sEstado: EstadoRegistro;
}

// USP_MNT_Almacenes, opción 02.
export interface AlmacenDetalle {
  nIdAlmacen: number;
  sNombre: string;
  sDireccion: string;
  nIdSupervisor: number;
  nIdZona: number;
  bEstado: boolean;
}

// USP_MNT_Almacenes, opción 03.
export interface ZonaCombo {
  nIdZona: number;
  sNombreZona: string;
}

// USP_MNT_Almacenes, opción 04.
export interface SupervisorCombo {
  nIdSupervisor: number;
  sNombrePersona: string;
}
