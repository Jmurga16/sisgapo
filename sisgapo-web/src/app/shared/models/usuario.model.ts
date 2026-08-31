import { EstadoRegistro } from './comun.model';

export interface UsuarioListado {
  nIdUsuario: number;
  sNombrePersona: string;
  sNombreUsuario: string;
  sNombreRol: string;
  sEstado: EstadoRegistro;
}

export interface UsuarioDetalle {
  sNombres: string;
  sApellidos: string;
  nTipoDoc: number;
  sNumDoc: string;
  sSexo: 'M' | 'F' | '';
  nIdRol: number;
  sDireccion: string;
  nTelefono: number;
  sContrasenia: string;
  dFechaNacimiento: string;
  dFechaNac: string;
}

export interface GeneroOpcion {
  abrev: 'M' | 'F';
  nombre: string;
}
