import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { LoginResultado } from 'src/app/shared/models';
import { LoginService } from './login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  sUser = new FormControl();
  sPassword = new FormControl();
  Rol: number;

  @Output() logeado = new EventEmitter<number>();

  constructor(
    private loginService: LoginService,
    private router: Router
  ) { }

  ngOnInit(): void {
    localStorage.clear();
  }

  async fnLogin(): Promise<void> {
    const sNombreUsuario = String(this.sUser.value || '').trim();
    const sContrasenia = String(this.sPassword.value || '');

    if (!sNombreUsuario || !sContrasenia) {
      await Swal.fire({ title: 'Complete usuario y contraseña.', icon: 'warning', timer: 2500 });
      return;
    }

    try {
      const resultados: LoginResultado[] = await this.loginService
        .fnServLogin(sNombreUsuario, sContrasenia);

      if (!resultados.length || resultados[0].result <= 0) {
        await Swal.fire({ title: 'Credenciales incorrectas', icon: 'error', timer: 3500 });
        return;
      }

      this.Rol = resultados[0].nIdRol;
      localStorage.setItem('Rol', String(this.Rol));
      this.logeado.emit(this.Rol);
      await this.router.navigate(['/', 'inicio']);
    } catch (error) {
      console.error(error as HttpErrorResponse);
      await Swal.fire({
        title: 'No se pudo conectar',
        text: 'El servidor no responde. Comprueba que la API esté levantada.',
        icon: 'error'
      });
    }
  }
}
