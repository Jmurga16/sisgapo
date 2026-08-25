import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from "@angular/router";
import Swal from 'sweetalert2';
import { LoginService } from './login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  sUser = new FormControl();
  sPassword = new FormControl();
  @Output() logeado: EventEmitter<any> = new EventEmitter();

  Rol: number;

  constructor(
    private loginService: LoginService,
    private router: Router) { }

  ngOnInit(): void {
   
    localStorage.clear();
  }

  async fnLogin() {

    const sNombreUsuario = (this.sUser.value || '').trim();
    const sContrasenia = this.sPassword.value || '';

    //Antes se enviaban vacios y el servidor respondia "Credenciales Incorrectas",
    //que es un mensaje enganoso cuando lo que falta es rellenar el formulario.
    if (!sNombreUsuario || !sContrasenia) {
      Swal.fire({
        title: 'Complete usuario y contraseña.',
        icon: 'warning',
        timer: 2500
      });
      return;
    }

    await this.loginService.LoginServ(sNombreUsuario, sContrasenia).then(
      (value: any = []) => {

        if (value.length > 0 && value[0].result > 0) {

          localStorage.setItem('Rol', value[0].nIdRol);
          this.Rol = (parseInt(localStorage.getItem("Rol")));
          this.logeado.emit(this.Rol);
          this.router.navigate(['/', 'inicio']);

        }
        else {
          //Antes este 'else' solo cubria el arreglo vacio: si el servidor
          //devolvia una fila con result 0, la pantalla se quedaba muda.
          Swal.fire({
            title: `Credenciales Incorrectas`,
            icon: 'error',
            timer: 3500
          });
        }

      },
      (error) => {
        //Antes solo se escribia en la consola: para el usuario, el boton no hacia nada.
        console.error(error);
        Swal.fire({
          title: 'No se pudo conectar',
          text: 'El servidor no responde. Comprueba que la API esté levantada.',
          icon: 'error'
        });
      }
    );

  }
}
