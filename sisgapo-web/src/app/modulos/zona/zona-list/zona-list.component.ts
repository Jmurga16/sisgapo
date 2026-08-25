import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { ZonaData } from '../Models/IZona';
import { ZonaService } from '../zona.service';
import Swal from 'sweetalert2';

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


  //#region Activar / Dar de baja
  //Baja logica, como en el resto de modulos. No existia en ninguna capa.
  async fnCambiarEstado(oZona: ZonaData, bEstado: boolean) {

    const sTitulo = bEstado ? '¿Desea activar la zona?' : '¿Desea dar de baja la zona?';

    const resp = await Swal.fire({
      title: sTitulo,
      text: oZona.sNombre,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    });

    if (!resp.isConfirmed) {
      return;
    }

    this.zonaService.cambiarEstado(oZona.nIdZona, bEstado).subscribe(
      (res: any) => {

        if (res && res.cod == 1) {
          Swal.fire({ title: res.mensaje, icon: 'success', timer: 3000 });
          this.fnGetZonas();
        }
        else {
          //Por ejemplo: la zona tiene almacenes activos.
          Swal.fire({
            title: 'No se pudo completar',
            text: res ? res.mensaje : 'La operacion no devolvio respuesta.',
            icon: 'error'
          });
        }

      },
      err => {
        console.error(err);
        Swal.fire({
          title: 'No se pudo completar',
          text: 'Error de comunicacion con el servidor.',
          icon: 'error'
        });
      }
    );

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
