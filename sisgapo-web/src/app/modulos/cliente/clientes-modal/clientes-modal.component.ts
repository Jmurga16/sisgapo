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
import { ClientesService } from "./../clientes.service";
import { ClienteData } from './../Models/ICLiente'
import Swal from "sweetalert2";

@Component({
  selector: 'app-clientes-modal',
  templateUrl: './clientes-modal.component.html',
  styleUrls: ['./clientes-modal.component.css']
})
export class ClientesModalComponent implements OnInit {

  nIdUsuario: number;
  nIdCliente: number;
  formCliente: FormGroup
  sAccionModal: string;

  constructor(
    public dialogRef: MatDialogRef<ClientesModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ClienteData,
    private clientesService: ClientesService,
    private fB: FormBuilder,
  ) { }

  ngOnInit(): void {
    //Definimos la accion Agregar o Editar
    this.sAccionModal = this.data.accion == 0 ? "Agregar" : "Editar";

    //Creamos el formulario reactivo 'formCliente'
    this.formCliente = this.fB.group({
      nIdCliente: [0, Validators.required],
      sNombre: ["", Validators.required],
      sEmail: ["", Validators.required],
      nTelefono: ["", Validators.required],
      sDireccion: ["", Validators.required],
      sDescripcion: ["", Validators.required]
    });
 
    //En caso ya tenga datos
    if (this.data.accion == 1) {
      this.nIdCliente = this.data.nIdCliente;
      this.formCliente.get("nIdCliente").setValue(this.nIdCliente)
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

  //#region Cargar Datos para Editar
  async fnCargarDatos() {
    let pParametro = [];
    //Parametro el Identificador del Cliente
    pParametro.push(this.nIdCliente);

    //Servicio de Cliente 02: Cargar por Id
    await this.clientesService.fnServClientes('02', pParametro).then(
      (value: any[]) => {

        //Llenar los datos precargados
        this.formCliente.get("sNombre").setValue(value[0].sNombre)
        this.formCliente.get("sEmail").setValue(value[0].sEmail)
        this.formCliente.get("nTelefono").setValue(value[0].nTelefono)
        this.formCliente.get("sDireccion").setValue(value[0].sDireccion)
        this.formCliente.get("sDescripcion").setValue(value[0].sDescripcion)

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
    if (this.formCliente.invalid) {
      return Swal.fire({
        title: sTitulo,
        icon: 'warning',
        timer: 1500
      });
    }

    let pParametro = [];
    let pOpcion = this.data.accion == 0 ? '03' : '04'; // 03-> Insertar / 04-> Editar

    //Llenar formulario
    pParametro.push(this.formCliente.get("sNombre").value);
    pParametro.push(this.formCliente.get("sEmail").value);
    pParametro.push(this.formCliente.get("nTelefono").value);
    pParametro.push(this.formCliente.get("sDireccion").value);
    pParametro.push(this.formCliente.get("sDescripcion").value);
    pParametro.push(this.nIdCliente);

    //Llamar servicio de clientes 03 / 04
    await this.clientesService.fnServClientes(pOpcion, pParametro).then(
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
