import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { ZonaData } from '../Models/IZona';
import { ZonaService } from '../zona.service';

@Component({
  selector: 'app-zona-list',
  templateUrl: './zona-list.component.html',
  styleUrls: ['./zona-list.component.css']
})
export class ZonaListComponent implements OnInit {

  //#region Variables
  lZonas: ZonaData[];
  //#endregion

  
  //#region Constructor
  constructor(
    private zonaService: ZonaService,
    private router: Router) {

  }
  //#endregion


  //#region OnInit
  ngOnInit(): void {

    //Obtener las zonas 
    this.fnGetZonas();

  }
  //#endregion


  //#region Ver Zona
  public fnVerZona(nIdZona) {
    //Ir a la zona escogida
    let sRuta = `zonas/editar/${nIdZona}`
    this.router.navigateByUrl(sRuta);

  }
  //#endregion


  //#region Obtener Zonas
  fnGetZonas() {
    //Llamar al servicio para obtener las zonas
    this.zonaService.getZonas().subscribe(
      (res: any) => {

        //Llenar la lista de zonas
        this.lZonas = res;

      },
      err => console.error(err)
    )
  }
  //#endregion


}
