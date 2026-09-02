export interface Sesion {
  sToken: string;
  nIdUsuario: number;
  nIdRol: number;
  sNombreUsuario: string;
  sNombrePersona: string;
  dExpira: string;
}

//Identificadores de TBL_ROL.
export const enum Rol {
  Administrador = 1,
  Supervisor = 2,
  Asistente = 3
}
