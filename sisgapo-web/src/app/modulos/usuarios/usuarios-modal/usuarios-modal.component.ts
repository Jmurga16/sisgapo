import {  
  MAT_DIALOG_DATA,
  MatDialogRef,
} from "@angular/material/dialog";
import {  
  FormGroup,
  FormBuilder,
  Validators,
} from "@angular/forms";
import { Component, OnInit, Inject } from "@angular/core";
import { UsuariosService } from "./../usuarios.service";
import { UsuarioData, ListaData, GeneroData } from './../Models/IUsuarios'
import { DateAdapter, MAT_DATE_FORMATS } from "@angular/material/core";
import { AppDateAdapter, APP_DATE_FORMATS } from "src/app/shared/services/AppDateAdapter";

import Swal from "sweetalert2";


@Component({
  selector: 'app-usuarios-modal',
  templateUrl: './usuarios-modal.component.html',
  styleUrls: ['./usuarios-modal.component.css'],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
  ]
})
export class UsuariosModalComponent implements OnInit {

  url: string;
  nIdUsuario: number;
  formUsuario: FormGroup
  sAccionModal: string;
  dFechaNacimiento: any;

  bOcultarPass = false;

  lDocumentos: ListaData[] = [
    { valor: 1, nombre: 'DNI' },
    { valor: 2, nombre: 'Carnet Ext.' },
  ];

  lRoles: ListaData[] = [
    { valor: 2, nombre: 'Supervisor' },
    { valor: 3, nombre: 'Asistente' },
  ];

  lSexo: GeneroData[] = [
    { abrev: 'M', nombre: 'Masculino' },
    { abrev: 'F', nombre: 'Femenino' },
  ];

  constructor(
    public dialogRef: MatDialogRef<UsuariosModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UsuarioData,
    private usuariosService: UsuariosService,
    private fB: FormBuilder,

  ) { }

  ngOnInit(): void {

    this.url = 'https://localhost:44360/';
    this.sAccionModal = this.data.accion == 0 ? "Agregar" : "Editar";

    this.formUsuario = this.fB.group({
      nIdUsuario: [0, Validators.required],
      sNombres: ["", Validators.required],
      sApellidos: ["", Validators.required],
      nTipoDoc: ["", Validators.required],
      sNumDoc: ["", Validators.required],
      sSexo: ["", Validators.required],
      nIdRol: ["", Validators.required],
      sDireccion: ["", Validators.required],
      nTelefono: ["", Validators.required],
      dFechaNacimiento: ["", Validators.required],
      sContrasenia: ["", Validators.required],
    });

    if (this.data.accion == 1) {
      this.nIdUsuario = this.data.nIdUsuario;
      this.formUsuario.get("nIdUsuario").setValue(this.nIdUsuario)
      this.fnCargarDatos();
    }

  }

  //#region Cargar Datos para Editar
  async fnCargarDatos() {
    let pParametro = [];
    pParametro.push(this.nIdUsuario);

    await this.usuariosService.LIS_Usuarios('03', pParametro, this.url).then(
      (value: any[]) => {

        this.formUsuario.get("sNombres").setValue(value[0].sNombres)
        this.formUsuario.get("sApellidos").setValue(value[0].sApellidos)
        this.formUsuario.get("nTipoDoc").setValue(value[0].nTipoDoc)
        this.formUsuario.get("sNumDoc").setValue(value[0].sNumDoc)
        this.formUsuario.get("sSexo").setValue(value[0].sSexo)
        this.formUsuario.get("nIdRol").setValue(value[0].nIdRol)
        this.formUsuario.get("sDireccion").setValue(value[0].sDireccion)
        this.formUsuario.get("nTelefono").setValue(value[0].nTelefono)        
        this.formUsuario.get("sContrasenia").setValue(value[0].sContrasenia)        
      },
      (error) => {
        console.log(error);
      }
    );
  }
  //#endregion 

  //#region Grabar
  async fnGrabar() {

    if (this.formUsuario.invalid) {
      return Swal.fire({
        title: `Ingrese todos los campos.`,
        icon: 'warning',
        timer: 1500
      });
    }

    let pParametro = [];
    let pOpcion = this.data.accion == 0 ? '04' : '05'; // 04-> Insertar / 05-> Editar

    pParametro.push(this.formUsuario.get("sNombres").value);
    pParametro.push(this.formUsuario.get("sApellidos").value);
    pParametro.push(this.formUsuario.get("nTipoDoc").value);
    pParametro.push(this.formUsuario.get("sNumDoc").value);
    pParametro.push(this.formUsuario.get("sSexo").value);
    pParametro.push(this.formUsuario.get("nIdRol").value);
    pParametro.push(this.formUsuario.get("sDireccion").value);
    pParametro.push(this.formUsuario.get("nTelefono").value);
    pParametro.push(this.dFechaNacimiento);
    pParametro.push(this.formUsuario.get("sContrasenia").value);
    pParametro.push(this.formUsuario.get("nIdUsuario").value);


    await this.usuariosService.LIS_Usuarios(pOpcion, pParametro, this.url).then(
      (value: any) => {

        if (value.mensaje == "OK") {
          Swal.fire({
            title: `Se registró con éxito`,
            icon: 'success',
            timer: 3500
          }).then(() => {
            this.fnCerrarModal(1);
          });
        }

      },
      (error) => {
        console.log(error);
      }
    );
  }
  //#endregion

  //#region Cambiar Fecha Nacimiento
  async fnCambiarFecha(event) {

    let sDia, sMes, sAnio, sFecha
    if (event.value.getDate() < 10) {
      sDia = "0" + event.value.getDate()
    } else {
      sDia = event.value.getDate()
    }
    if ((event.value.getMonth() + 1) < 10) {
      sMes = "0" + (event.value.getMonth() + 1)
    }
    else {
      sMes = event.value.getMonth() + 1
    }
    sAnio = event.value.getFullYear()

    this.dFechaNacimiento = sAnio + '-' + sMes + '-' + sDia

  }
  //#endregion Cambiar Fecha Entrega

  //#region Conversión de Fechas
  fnConvertirFecha(FechaParametro, nTipo) {

    let sDia, sMes, sAnio, sFecha
    var sCadena

    // Datetime a String(YYYY-mm-dd)
    if (nTipo == 1) {

      if (FechaParametro != '') {

        sCadena = FechaParametro.split('-', 3);

        sDia = sCadena[2].substring(0, 2)
        sMes = sCadena[1]
        sAnio = sCadena[0]

        sFecha = sAnio + '-' + sMes + '-' + sDia

        return sFecha
      }
      else {
        return ''
      }
    }
  }
  //#endregion

  //#region Cerrar
  fnCerrarModal(result) {
    if (result == 1) {
      this.dialogRef.close(result);
    }
    else {
      this.dialogRef.close();
    }
  }
  //#endregion

}

