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

  lAlmacenes: ZonaData[];

  constructor(
    private zonaService: ZonaService,
    private router: Router) { }

  ngOnInit(): void {

    this.fnGetZonas();


  }

  public fnVerZona(nIdZona) {

    let sRuta = `zonas/editar/${nIdZona}`

    this.router.navigateByUrl(sRuta);

  }

  //#region Obtener Zonas
  fnGetZonas(){
    this.zonaService.getZonas().subscribe(
      (res:any)=>{
        
        this.lAlmacenes=res;
      
      },
      err=>console.error(err)
    )
  }
  //#endregion

}
