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

  sTitulo: string;
  sRutaImagen: string;
  nIdZona: number;
  bEditar: boolean = false;

  fNombre = new FormControl();
  fRutaImagen = new FormControl();

  lZona: ZonaData = {
    nIdZona: 0,
    sNombre: '',
    sRutaImagen: ''
  }

  constructor(
    private zonaService: ZonaService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {

    this.sTitulo = "Creación de Zona"
    this.sRutaImagen = 'https://www.allianceplast.com/wp-content/uploads/2017/11/no-image.png'

    const params = this.activatedRoute.snapshot.params;

    if (params.id) {

      this.sTitulo = 'Ver Zona'

      this.zonaService.getOne(params.id).subscribe(
        (res: any) => {

          this.lZona = res;

          this.nIdZona = params.id
          this.fNombre.setValue(this.lZona[0].sNombre);
          this.fRutaImagen.setValue(this.lZona[0].sRutaImagen);

          this.sRutaImagen = this.lZona[0].sRutaImagen;

          this.bEditar = true;

        },
        err => console.error(err)
      );
    }
  }

  fnSaveNewZona() {

    //eliminar datos al guardar :
    delete this.lZona.nIdZona;

    if (this.fNombre.value == '' || this.fNombre.value == undefined) {
      return Swal.fire({
        title: `Complete el campo Nombre.`,
        icon: 'warning',
        timer: 3500
      });
    }
    if (this.fRutaImagen.value == '' || this.fRutaImagen.value == undefined) {
      return Swal.fire({
        title: `Complete el campo Ruta de Imagen.`,
        icon: 'warning',
        timer: 3500
      });
    }
    if (!this.fnValidarImagen) {
      return;
    }

    this.lZona.sNombre = this.fNombre.value
    this.lZona.sRutaImagen = this.fRutaImagen.value

    //fin eliminar datos
    this.zonaService.saveZona(this.lZona)
      .subscribe(
        res => {
          this.router.navigate(['/', 'zonas']);
        },
        err => this.router.navigate(['/', 'zonas'])

      );

  }

  changeImagen() {

    if (this.fRutaImagen.value == '') {
      this.sRutaImagen = 'https://www.allianceplast.com/wp-content/uploads/2017/11/no-image.png'
    }
    else {
      this.sRutaImagen = this.fRutaImagen.value
      this.fnValidarImagen();
    }

  }

  async fnValidarImagen() {
    let bValido: boolean = true;
    var imagen = this.fRutaImagen.value
    var extension = imagen.substr(-4)
   

    if (extension == '.png' || extension == '.jpg') {
      bValido = true;
    }
    else {
      
      bValido = false;
      this.fRutaImagen.setValue('');
      this.sRutaImagen = 'https://www.allianceplast.com/wp-content/uploads/2017/11/no-image.png'
      Swal.fire({
        title: `Formato de Imagen No Válida.`,
        icon: 'warning',
        timer: 3500
      });
    }

    return bValido;

  }



}
