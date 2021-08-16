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

  url: string;
  Rol: number;

  constructor(
    private loginService: LoginService,
    private router: Router) { }

  ngOnInit(): void {

    this.url = 'https://localhost:44360/';
    console.log(this.Rol);
    localStorage.clear();
  }

  async fnLogin() {
    let sNombreUsuario = this.sUser.value;
    let sContrasenia = this.sPassword.value;
    await this.loginService.LoginServ(sNombreUsuario, sContrasenia, this.url).then(
      (value: any = []) => {

        if (value.length > 0) {
          if (value[0].result > 0) {

            localStorage.setItem('Rol', value[0].nIdRol);

            this.Rol = (parseInt(localStorage.getItem("Rol")));
            this.logeado.emit(this.Rol);

            this.router.navigate(['/', 'inicio']);


          }
        }
        else {
          Swal.fire({
            title: `Credenciales Incorrectas`,
            icon: 'error',
            timer: 3500
          });
        }
        console.log("Rol activo")
        console.log(this.Rol)

      },
      (error) => {
        console.log(error);
      }
    );


  }
}
