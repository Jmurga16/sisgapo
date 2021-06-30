import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ZonaService } from '../zona.service';
import { ActivatedRoute, Router } from "@angular/router";
import { ZonaData } from '../Models/IZona';

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
    }

  }


}
