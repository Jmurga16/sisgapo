import { Component, OnInit, Inject } from "@angular/core";
import { InventarioService } from "./../../inventario.service";
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from "@angular/material/dialog";
import {
  FormGroup,
  FormBuilder,
  Validators,
} from "@angular/forms";

import { DateAdapter, MAT_DATE_FORMATS } from "@angular/material/core";
import { AppDateAdapter, APP_DATE_FORMATS } from "src/app/shared/services/AppDateAdapter";

import Swal from "sweetalert2";
import { ProductoData } from "../productos.component";


@Component({
  selector: 'app-productos-modal',
  templateUrl: './productos-modal.component.html',
  styleUrls: ['./productos-modal.component.css'],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
  ]
})
export class ProductosModalComponent implements OnInit {

  url: string;
  nIdUsuario: number;
  nIdCatProd: number;
  formProducto: FormGroup
  sAccionModal: string;

  lAlmacenes = []
  lCategorias = []
  lUnidadMedida = []

  dFechaFab: any;
  dFechaVenc: any;

  constructor(
    private inventarioService: InventarioService,
    public dialogRef: MatDialogRef<ProductosModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProductoData,
    private fB: FormBuilder,

  ) {
    this.url = 'https://localhost:44360/';

  }

  ngOnInit(): void {

    this.sAccionModal = this.data.accion == 0 ? "Agregar" : "Editar";

    this.formProducto = this.fB.group({
      nIdCatProd: 0,
      sNombreProducto: ["", Validators.required],
      nIdAlmacen: [0, Validators.required],
      nIdCategoria: [0, Validators.required],
      nIdUnidadMedida: [0, Validators.required],
      nCantidad: [0, Validators.required],
      nPrecio: [0, Validators.required],
      sNombreLote: '',
      dFechaFab: ["", Validators.required],
      dFechaVenc: ["", Validators.required],
      sDescripcion: ["", Validators.required],
    });

    this.fnListarAlmacenes();
    this.fnListarCategorias();
    this.fnListarUnidadMedida();


    if (this.data.accion == 1) {
      this.nIdCatProd = this.data.nIdCatProd;
      this.formProducto.get("nIdCatProd").setValue(this.nIdCatProd)
      this.fnCargarDatos();
    }

  }

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


  //#region Cargar Datos para Editar
  async fnCargarDatos() {
    let pParametro = [];
    pParametro.push(this.nIdCatProd);

    await this.inventarioService.fnServProducto('05', pParametro, this.url).then(
      (value: any[]) => {

        this.formProducto.get("sNombreProducto").setValue(value[0].sNombreProducto)
        this.formProducto.get("nIdAlmacen").setValue(value[0].nIdAlmacen)
        this.formProducto.get("nIdCategoria").setValue(value[0].nIdCategoria)
        this.formProducto.get("nIdUnidadMedida").setValue(value[0].nIdUnidadMedida)
        this.formProducto.get("nCantidad").setValue(value[0].nCantidad)
        this.formProducto.get("nPrecio").setValue(value[0].nPrecio)
        this.formProducto.get("dFechaFab").setValue(value[0].dFechaFabPicker)
        this.formProducto.get("dFechaVenc").setValue(value[0].dFechaVencPicker)
        this.formProducto.get("sDescripcion").setValue(value[0].sDescripcion)
      },
      (error) => {
        console.log(error);
      }
    );
  }
  //#endregion 


  //#region Listar Almacenes
  async fnListarAlmacenes() {
    let pParametro = [];

    await this.inventarioService.fnServProducto('01', pParametro, this.url).then(
      (value: any[]) => {

        this.lAlmacenes = value;

      },
      (error) => {
        console.log(error);
      }
    );
  }
  //#endregion


  //#region Listar Categorias
  async fnListarCategorias() {
    let pParametro = [];

    await this.inventarioService.fnServProducto('02', pParametro, this.url).then(
      (value: any[]) => {

        this.lCategorias = value;
      
      },
      (error) => {
        console.log(error);
      }
    );
  }
  //#endregion


  //#region Listar Unidades de Medida
  async fnListarUnidadMedida() {
    let pParametro = [];

    await this.inventarioService.fnServProducto('04', pParametro, this.url).then(
      (value: any[]) => {

        this.lUnidadMedida = value;

      },
      (error) => {
        console.log(error);
      }
    );
  }
  //#endregion


  //#region Grabar
  async fnGrabar() {

    if (this.formProducto.invalid) {
      return Swal.fire({
        title: `Ingrese todos los campos.`,
        icon: 'warning',
        timer: 1500
      });
    }

    let pParametro = [];
    let pOpcion = this.data.accion == 0 ? '06' : '07'; // 06-> Insertar / 07-> Editar

    pParametro.push(this.formProducto.get("sNombreProducto").value);
    pParametro.push(this.formProducto.get("nIdAlmacen").value);
    pParametro.push(this.formProducto.get("nIdCategoria").value);
    pParametro.push(this.formProducto.get("nIdUnidadMedida").value);
    pParametro.push(this.formProducto.get("nCantidad").value);
    pParametro.push(this.formProducto.get("nPrecio").value);
    pParametro.push(this.dFechaFab);
    pParametro.push(this.dFechaVenc);
    pParametro.push(this.formProducto.get("sDescripcion").value);
    pParametro.push(this.formProducto.get("nIdCatProd").value);


    await this.inventarioService.fnServProducto(pOpcion, pParametro, this.url).then(
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


  //#region Cambiar Fecha
  async fnCambiarFecha(event, nTipo) {

    let sDia, sMes, sAnio, sFecha

    sDia= (event.value.getDate() < 10) ? "0" + event.value.getDate() : event.value.getDate();    
    sMes= ((event.value.getMonth() + 1) < 10) ? "0" + (event.value.getMonth() + 1) : event.value.getMonth() + 1
   
    sAnio = event.value.getFullYear()

    if (nTipo == 1) {
      this.dFechaFab = sAnio + '-' + sMes + '-' + sDia
    }
    else if (nTipo == 2) {
      this.dFechaVenc = sAnio + '-' + sMes + '-' + sDia
    }


  }
  //#endregion Cambiar Fecha


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



}
