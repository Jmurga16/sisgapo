export type ParametroApi = string | number;

export interface RespuestaApi {
  cod: string;
  mensaje: string;
}

export interface RespuestaUsuarios {
  mensaje: string;
}

export interface ConfiguracionAplicacion {
  demoSoloLectura: boolean;
}

export enum AccionModal {
  Agregar = 0,
  Editar = 1
}

export interface DatosModal {
  accion: AccionModal;
  nId: number;
}

export interface ListaOpcion {
  valor: number;
  nombre: string;
}

export type EstadoRegistro = 'Activo' | 'Inactivo';

export enum ValorEstado {
  Inactivo = 0,
  Activo = 1
}
