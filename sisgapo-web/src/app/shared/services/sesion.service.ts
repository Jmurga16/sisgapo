import { Injectable } from '@angular/core';
import { Rol, Sesion } from 'src/app/shared/models';

@Injectable({
  providedIn: 'root'
})
export class SesionService {
  private static readonly sClave = 'sisgapo.sesion';

  fnGuardar(oSesion: Sesion): void {
    localStorage.setItem(SesionService.sClave, JSON.stringify(oSesion));
  }

  fnObtener(): Sesion | null {
    const sBruto = localStorage.getItem(SesionService.sClave);

    if (!sBruto) {
      return null;
    }

    try {
      const oSesion = JSON.parse(sBruto) as Sesion;

      if (!oSesion || !oSesion.sToken) {
        return null;
      }

      if (this.fnHaCaducado(oSesion)) {
        this.fnCerrar();
        return null;
      }

      return oSesion;
    } catch {
      this.fnCerrar();
      return null;
    }
  }

  fnObtenerToken(): string | null {
    const oSesion = this.fnObtener();
    return oSesion ? oSesion.sToken : null;
  }

  fnObtenerRol(): number {
    const oSesion = this.fnObtener();
    return oSesion ? oSesion.nIdRol : 0;
  }

  fnEstaAutenticado(): boolean {
    return this.fnObtener() !== null;
  }

  fnEsAdministrador(): boolean {
    return this.fnObtenerRol() === Rol.Administrador;
  }

  fnPuedeGestionarInventario(): boolean {
    const nRol = this.fnObtenerRol();
    return nRol === Rol.Administrador || nRol === Rol.Supervisor;
  }

  fnCerrar(): void {
    localStorage.removeItem(SesionService.sClave);
  }

  private fnHaCaducado(oSesion: Sesion): boolean {
    if (!oSesion.dExpira) {
      return false;
    }

    const nExpira = Date.parse(oSesion.dExpira);

    return isNaN(nExpira) ? false : nExpira <= Date.now();
  }
}
