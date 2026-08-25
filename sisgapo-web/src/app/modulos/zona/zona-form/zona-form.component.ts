import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ZonaService } from '../zona.service';
import { ActivatedRoute, Router } from "@angular/router";
import { ZonaData } from '../Models/IZona';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-zona-form',
  templateUrl: './zona-form.component.html',
  styleUrls: ['./zona-form.component.css']
})
export class ZonaFormComponent implements OnInit {

  //#region Definicion de Variables  
  sTitulo: string;
  sRutaImagen: string;
  nIdZona: number;
  bEditar: boolean = false;
  urlNoImagen: string = '../../../../assets/no-image.png'


  fNombre = new FormControl();
  fRutaImagen = new FormControl();

  lZona: ZonaData = {
    nIdZona: 0,
    sNombre: '',
    sRutaImagen: ''
  }
  //#endregion


  //#region Definicion Constructor
  constructor(
    private zonaService: ZonaService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {

  }

  //#region Definir OnInit
  ngOnInit(): void {
    // Definir Titulo
    this.sTitulo = "Creación de Zona"
    // Definir Ruta de Imagen
    this.sRutaImagen = 'https://www.allianceplast.com/wp-content/uploads/2017/11/no-image.png'

    // Obtener los parametros segun ruta
    const params = this.activatedRoute.snapshot.params;

    // Si existe la Zona
    if (params.id) {
      // Definir Titulo
      this.sTitulo = 'Editar Zona'

      //Llamar al servicio cargar zona por id
      this.zonaService.getOne(params.id).subscribe(
        (res: any) => {


          this.lZona = res;
          //Llenar los datos
          this.nIdZona = params.id
          this.fNombre.setValue(this.lZona[0].sNombre);
          this.fRutaImagen.setValue(this.lZona[0].sRutaImagen);

          this.sRutaImagen = this.lZona[0].sRutaImagen;

          this.bEditar = true;

        },
        //Mensaje erroneo
        err => console.error(err)
      );
    }
  }

  //#endregion


  //#region Guardar Zona
  //Antes este metodo llamaba siempre a saveZona() (POST -> INSERT) y ademas
  //borraba el identificador con "delete this.lZona.nIdZona", asi que editar una
  //zona creaba un duplicado. Y navegaba al listado tanto si guardaba como si
  //fallaba. Ver 06-hallazgos.md C-03 y C-05.
  async fnSaveNewZona() {

    //Validar que el campo nombre este completo
    if (this.fNombre.value == '' || this.fNombre.value == undefined) {
      return Swal.fire({
        title: `Complete el campo Nombre.`,
        icon: 'warning',
        timer: 3500
      });
    }

    //Validar que el campo ruta este completo
    if (this.fRutaImagen.value == '' || this.fRutaImagen.value == undefined) {
      return Swal.fire({
        title: `Complete el campo Ruta de Imagen.`,
        icon: 'warning',
        timer: 3500
      });
    }

    //Validar el formato de la ruta.
    //Faltaban los parentesis: "if (!this.fnValidarImagen)" evalua la referencia a
    //la funcion, que siempre es truthy, asi que la validacion nunca se ejecutaba.
    if (!(await this.fnValidarImagen())) {
      return;
    }

    //Obtener los valores del formulario
    const oZona: ZonaData = {
      nIdZona: this.bEditar ? Number(this.nIdZona) : 0,
      sNombre: this.fNombre.value,
      sRutaImagen: this.fRutaImagen.value
    };

    //Alta o edicion segun como se haya entrado a la pantalla
    const oPeticion = this.bEditar
      ? this.zonaService.updateZona(oZona)
      : this.zonaService.saveZona(oZona);

    oPeticion.subscribe(
      (res: any) => {

        if (res && res.cod == 1) {
          Swal.fire({
            title: res.mensaje,
            icon: 'success',
            timer: 3000
          }).then(() => {
            this.router.navigate(['/', 'zonas']);
          });
        }
        //Nombre duplicado u otro rechazo del procedimiento: se queda en el
        //formulario con el motivo a la vista, en vez de navegar en silencio.
        else {
          Swal.fire({
            title: 'No se pudo guardar',
            text: res ? res.mensaje : 'La operacion no devolvio respuesta.',
            icon: 'error'
          });
        }

      },
      (err) => {
        console.error(err);
        Swal.fire({
          title: 'No se pudo guardar',
          text: 'Error de comunicacion con el servidor.',
          icon: 'error'
        });
      }
    );

  }
  //#endregion


  //#region Al cambiar ruta de Imagen
  changeImagen() {

    //#region Validar imagen en blanco
    if (this.fRutaImagen.value == '') {
      this.sRutaImagen = this.urlNoImagen
    }

    //Validar Imagen
    else {
      this.sRutaImagen = this.fRutaImagen.value
      this.fnValidarImagen();
    }

  }
  //#endregion


  //#region Validar Imagen
  async fnValidarImagen() {
    let bValido: boolean;
    //definir imagen
    var imagen = this.fRutaImagen.value
    //traer la extension
    var extension = imagen.substr(-4)

    //evaluar la extension
    if (extension == '.png' || extension == '.jpg') {
      bValido = true;
    }
    //si no es png ni jpg, volver a blanco
    else {
      bValido = false;
      this.fRutaImagen.setValue('');
      this.sRutaImagen = this.urlNoImagen
      //Mensaje de no valido
      Swal.fire({
        title: `Formato de Imagen No Válida.`,
        icon: 'warning',
        timer: 3500
      });
    }

    return bValido;

  }
  //#endregion


}
