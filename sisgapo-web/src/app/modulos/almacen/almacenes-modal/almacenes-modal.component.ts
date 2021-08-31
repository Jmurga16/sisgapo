import { Component, OnInit, Inject } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
} from "@angular/forms";
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from "@angular/material/dialog";
import { AlmacenesService } from "./../almacenes.service";
import { AlmacenData, ZonaData, SupervisorData } from './../Models/IAlmacen'
import Swal from "sweetalert2";


@Component({
  selector: 'app-almacenes-modal',
  templateUrl: './almacenes-modal.component.html',
  styleUrls: ['./almacenes-modal.component.css']
})
export class AlmacenesModalComponent implements OnInit {

  url: string;
  nIdUsuario: number;
  nIdAlmacen: number;
  formAlmacen: FormGroup
  sAccionModal: string;

  lZonas: ZonaData[]
  lSupervisores: SupervisorData[]

  constructor(
    public dialogRef: MatDialogRef<AlmacenesModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AlmacenData,
    private almacenesService: AlmacenesService,
    private fB: FormBuilder,
  ) {
    //Traemos la URL del Back
    this.url = 'https://localhost:44360/';
  }

  ngOnInit(): void {

    //Definimos la accion Agregar o Editar
    this.sAccionModal = this.data.accion == 0 ? "Agregar" : "Editar";

    //Creamos el formulario reactivo 'formAlmacen'
    this.formAlmacen = this.fB.group({
      nIdAlmacen: [0, Validators.required],
      sNombreAlmacen: ["", Validators.required],
      sDireccion: ["", Validators.required],
      nIdZona: ["", Validators.required],
      nIdSupervisor: ["", Validators.required]
    });

    //Traemos los combos de zonas y supervisores
    this.fnListarZonas();
    this.fnListarSupervisor();

    //En caso ya tenga datos
    if (this.data.accion == 1) {
      this.nIdAlmacen = this.data.nIdAlmacen;
      this.formAlmacen.get("nIdAlmacen").setValue(this.nIdAlmacen)
      this.fnCargarDatos();
    }

  }


  //#region Cerrar
  fnCerrarModal(result) {
    //Resultado 1 es para insertar
    if (result == 1) {
      this.dialogRef.close(result);
    }
    //Resultado indefinido solo cierra
    else {
      this.dialogRef.close();
    }
  }
  //#endregion Cerrar


  //#region Listar Usuarios
  async fnListarZonas() {
    let pParametro = [];

    //Servicio de Almacen 03: Listar Zonas
    await this.almacenesService.fnServAlmacenes('03', pParametro, this.url).then(
      (value: any[]) => {

        this.lZonas = value;

      },
      (error) => {
        console.log(error);
      }
    );
  }
  //#endregion


  //#region Listar Supervisores
  async fnListarSupervisor() {
    let pParametro = [];

    //Servicio de Almacen 04: Listar Supervisores
    await this.almacenesService.fnServAlmacenes('04', pParametro, this.url).then(
      (value: any[]) => {

        this.lSupervisores = value;

      },
      (error) => {
        console.log(error);
      }
    );
  }
  //#endregion


  //#region Cargar Datos para Editar
  async fnCargarDatos() {
    let pParametro = [];
    //Parametro el Identificador del Almacen
    pParametro.push(this.nIdAlmacen);

    //Servicio de Almacen 02: Cargar por Id
    await this.almacenesService.fnServAlmacenes('02', pParametro, this.url).then(
      (value: any[]) => {

        //Llenar los datos precargados
        this.formAlmacen.get("sNombreAlmacen").setValue(value[0].sNombre)
        this.formAlmacen.get("sDireccion").setValue(value[0].sDireccion)
        this.formAlmacen.get("nIdZona").setValue(value[0].nIdZona)
        this.formAlmacen.get("nIdSupervisor").setValue(value[0].nIdSupervisor)

      },
      (error) => {
        console.log(error);
      }
    );
  }
  //#endregion 


  //#region Grabar
  async fnGrabar() {
    //Definir mensaje
    let sTitulo = 'Ingrese todos los campos.'

    //Validar formulario de almacen
    if (this.formAlmacen.invalid) {
      return Swal.fire({
        title: sTitulo,
        icon: 'warning',
        timer: 1500
      });
    }

    let pParametro = [];
    let pOpcion = this.data.accion == 0 ? '05' : '06'; // 05-> Insertar / 06-> Editar

    //Llenar formulario
    pParametro.push(this.formAlmacen.get("sNombreAlmacen").value);
    pParametro.push(this.formAlmacen.get("sDireccion").value);
    pParametro.push(this.formAlmacen.get("nIdSupervisor").value);
    pParametro.push(this.formAlmacen.get("nIdZona").value);
    pParametro.push(this.nIdAlmacen);

    //Llamar servicio de almacenes 05 / 06
    await this.almacenesService.fnServAlmacenes(pOpcion, pParametro, this.url).then(
      (value: any) => {

        //Si es válido, retornar mensaje de exito
        if (value.cod == 1) {
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

}
