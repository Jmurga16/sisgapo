import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Sesion } from 'src/app/shared/models';
import { SesionService } from 'src/app/shared/services/sesion.service';
import { LoginService } from './login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  sUser = new FormControl();
  sPassword = new FormControl();
  nRol: number = 0;

  @Output() logeado = new EventEmitter<number>();

  constructor(
    private loginService: LoginService,
    private sesionService: SesionService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.sesionService.fnCerrar();
  }

  async fnLogin(): Promise<void> {
    const sNombreUsuario = String(this.sUser.value || '').trim();
    const sContrasenia = String(this.sPassword.value || '');

    if (!sNombreUsuario || !sContrasenia) {
      await Swal.fire({ title: 'Complete usuario y contraseña.', icon: 'warning', timer: 2500 });
      return;
    }

    try {
      const oSesion: Sesion = await this.loginService.fnServLogin(sNombreUsuario, sContrasenia);

      if (!oSesion || !oSesion.sToken) {
        await Swal.fire({ title: 'Credenciales incorrectas', icon: 'error', timer: 3500 });
        return;
      }

      this.sesionService.fnGuardar(oSesion);
      this.nRol = oSesion.nIdRol;
      this.logeado.emit(this.nRol);
      await this.router.navigate(['/', 'inicio']);
    } catch (error) {
      const oError = error as HttpErrorResponse;

      if (oError.status === 401) {
        await Swal.fire({ title: 'Credenciales incorrectas', icon: 'error', timer: 3500 });
        return;
      }

      if (oError.status === 429) {
        await Swal.fire({
          title: 'Demasiados intentos',
          text: oError.error && oError.error.mensaje
            ? oError.error.mensaje
            : 'Vuelve a intentarlo en un minuto.',
          icon: 'warning'
        });
        return;
      }

      console.error(oError);
      await Swal.fire({
        title: 'No se pudo conectar',
        text: 'El servidor no responde. Comprueba que la API esté levantada.',
        icon: 'error'
      });
    }
  }
}
