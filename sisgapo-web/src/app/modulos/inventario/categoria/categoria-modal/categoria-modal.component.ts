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

import { InventarioService } from "./../../inventario.service";
import { CategoriaData } from './../../Models/ICategoria'
import Swal from "sweetalert2";


@Component({
  selector: 'app-categoria-modal',
  templateUrl: './categoria-modal.component.html',
  styleUrls: ['./categoria-modal.component.css']
})
export class CategoriaModalComponent implements OnInit {

  url: string;
  nIdUsuario: number;
  nIdCategoria: number;
  formCategoria: FormGroup
  sAccionModal: string;

  lCategorias: CategoriaData[]

  constructor(
    public dialogRef: MatDialogRef<CategoriaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CategoriaData,
    private inventarioService: InventarioService,
    private fB: FormBuilder,
  ) {
    this.url = 'https://localhost:44360/';
  }

  ngOnInit(): void {
    this.sAccionModal = this.data.accion == 0 ? "Agregar" : "Editar";

    this.formCategoria = this.fB.group({
      nIdCategoria: [0, Validators.required],
      sNombre: ["", Validators.required],
      sDescripcion: ["", Validators.required],

    });

    if (this.data.accion == 1) {
      this.nIdCategoria = this.data.nIdCategoria;
      this.formCategoria.get("nIdCategoria").setValue(this.nIdCategoria)
      this.fnCargarDatos();
    }

  }


  //#region Grabar
  async fnGrabar() {

    if (this.formCategoria.invalid) {
      return Swal.fire({
        title: `Ingrese todos los campos.`,
        icon: 'warning',
        timer: 1500
      });
    }

    let pParametro = [];
    let pOpcion = this.data.accion == 0 ? '03' : '04'; // 03-> Insertar / 04-> Editar

    pParametro.push(this.formCategoria.get("sNombre").value);
    pParametro.push(this.formCategoria.get("sDescripcion").value);
    pParametro.push(this.nIdCategoria);

    await this.inventarioService.fnServCategoria(pOpcion, pParametro, this.url).then(
      (value: any) => {

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


  //#region Cargar Datos
  async fnCargarDatos() {
    let pParametro = [];
    pParametro.push(this.nIdCategoria);

    await this.inventarioService.fnServCategoria('02', pParametro, this.url).then(
      (value: any[]) => {
        this.formCategoria.get("sNombre").setValue(value[0].sNombre)
        this.formCategoria.get("sDescripcion").setValue(value[0].sDescripcion)
      },
      (error) => {
        console.log(error);
      }
    );
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
