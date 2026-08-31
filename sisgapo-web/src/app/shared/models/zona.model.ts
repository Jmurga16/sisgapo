import { EstadoRegistro } from './comun.model';

export interface ZonaListado {
  nIdZona: number;
  sNombre: string;
  sRutaImagen: string;
  bEstado: boolean;
  sEstado: EstadoRegistro;
}

export interface ZonaGuardar {
  nIdZona: number;
  sNombre: string;
  sRutaImagen: string;
}
