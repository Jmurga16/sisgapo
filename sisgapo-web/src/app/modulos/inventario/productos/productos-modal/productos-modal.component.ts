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
    public dialogRef: MatDialogRef<ProductosModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProductoData,
    private inventarioService: InventarioService,
    private fB: FormBuilder,

  ) {
    //Definicion de URL
    this.url = 'https://localhost:44360/';
  }

  ngOnInit(): void {

    //Definir si se agrega o se edita
    this.sAccionModal = this.data.accion == 0 ? "Agregar" : "Editar";

    //Crear formulario Reactivo 'formProducto
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

    //Traer datos de los combos 
    this.fnListarAlmacenes();
    this.fnListarCategorias();
    this.fnListarUnidadMedida();

    //Cargar datos a editar
    if (this.data.accion == 1) {
      this.nIdCatProd = this.data.nIdCatProd;
      this.formProducto.get("nIdCatProd").setValue(this.nIdCatProd)
      this.fnCargarDatos();
    }

  }

  //#region Cerrar
  fnCerrarModal(result) {
    //1 Inserta
    if (result == 1) {
      this.dialogRef.close(result);
    }
    //Indefinido solo cierra
    else {
      this.dialogRef.close();
    }
  }
  //#endregion


  //#region Cargar Datos para Editar
  async fnCargarDatos() {
    let pParametro = [];
    //Leer el identificador de producto por zona
    pParametro.push(this.nIdCatProd);

    //Llamar Servicio de Inventario 05: Precargar datos por id
    await this.inventarioService.fnServProducto('05', pParametro, this.url).then(
      (value: any[]) => {

        //Cargar los formularios
        //Identificador de Producto
        this.formProducto.get("sNombreProducto").setValue(value[0].sNombreProducto)
        //Identificador de Almacen
        this.formProducto.get("nIdAlmacen").setValue(value[0].nIdAlmacen)
        //Identificador de Categoria
        this.formProducto.get("nIdCategoria").setValue(value[0].nIdCategoria)
        //Identificador de Unidad de Medida
        this.formProducto.get("nIdUnidadMedida").setValue(value[0].nIdUnidadMedida)
        //Nombre de Cantidad
        this.formProducto.get("nCantidad").setValue(value[0].nCantidad)
        //Nombre de nPrecio
        this.formProducto.get("nPrecio").setValue(value[0].nPrecio)
        //Nombre de dFechaFab
        this.formProducto.get("dFechaFab").setValue(value[0].dFechaFabPicker)
        //Nombre de dFechaVenc
        this.formProducto.get("dFechaVenc").setValue(value[0].dFechaVencPicker)
        //Nombre de sDescripcion
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

    //Validar el Formulario reactvio
    if (this.formProducto.invalid) {
      return Swal.fire({
        title: `Ingrese todos los campos.`,
        icon: 'warning',
        timer: 1500
      });
    }

    //Validar Numeros solo positivos
    if(!(await this.fnValidarNum())){
      return
    }

    let pParametro = [];
    let pOpcion = this.data.accion == 0 ? '06' : '07'; // 06-> Insertar / 07-> Editar

    //Llenar los formularios reactivos
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

    //Llamar al servicio de Insertar
    await this.inventarioService.fnServProducto(pOpcion, pParametro, this.url).then(
      (value: any) => {

        //Si se registra con exito
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
        //En caso de error
        console.log(error);
      }
    );
  }
  //#endregion


  //#region Cambiar Fecha
  async fnCambiarFecha(event, nTipo) {
//Declarar Dia, Mes y año
    let sDia, sMes, sAnio, sFecha

    //Evaluacion de Dia, Mes y Año
    sDia = (event.value.getDate() < 10) ? "0" + event.value.getDate() : event.value.getDate();
    sMes = ((event.value.getMonth() + 1) < 10) ? "0" + (event.value.getMonth() + 1) : event.value.getMonth() + 1
    sAnio = event.value.getFullYear()

    //Segun el tipo de Fecha
    //1 es Fecha de Fabricacion
    if (nTipo == 1) {
      this.dFechaFab = sAnio + '-' + sMes + '-' + sDia
    }
    //2 es Fecha de Vencimiento
    else if (nTipo == 2) {
      this.dFechaVenc = sAnio + '-' + sMes + '-' + sDia
    }
   
  }
  //#endregion Cambiar Fecha


  //#region Conversión de Fechas
  fnConvertirFecha(FechaParametro, nTipo) {
    //Declaracion de dia, mes, año y fecha
    let sDia, sMes, sAnio, sFecha
    var sCadena

    // Datetime a String(YYYY-mm-dd)
    if (nTipo == 1) {

      //Validar que la fecha no sea vacia
      if (FechaParametro != '') {

        //Deconcatena la fecha
        sCadena = FechaParametro.split('-', 3);

        //Divide la fecha por dia mes y año
        sDia = sCadena[2].substring(0, 2)
        sMes = sCadena[1]
        sAnio = sCadena[0]

        //Une la fecha
        sFecha = sAnio + '-' + sMes + '-' + sDia

        return sFecha
      }
      else {
        return ''
      }
    }
  }
  //#endregion

   //#region Validar Numeros
   fnValidarNum() {
     //Declarar booleano
    let bValido: boolean = true;

    //Traer la Cantidad
    let nCantidad = this.formProducto.controls.nCantidad.value
    //Traer el precio
    let nPrecio = this.formProducto.controls.nPrecio.value

    //Evaluar que cantidad y precio sean mayor que 0
    if (nCantidad < 0 || nPrecio < 0) {
      bValido = false;
      Swal.fire({
        title: `No se permiten cantidades negativas.`,
        icon: 'warning',
        timer: 1500
      });
    }

    return bValido
  }
  //#endregion


}
