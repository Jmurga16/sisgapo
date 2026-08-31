import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { RespuestaApi, ZonaListado } from 'src/app/shared/models';
import { ZonaService } from '../zona.service';

@Component({
  selector: 'app-zona-list',
  templateUrl: './zona-list.component.html',
  styleUrls: ['./zona-list.component.css']
})
export class ZonaListComponent implements OnInit {
  lZonas: ZonaListado[] = [];

  constructor(
    private zonaService: ZonaService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.fnGetZonas();
  }

  fnVerZona(nIdZona: number): void {
    this.router.navigateByUrl(`zonas/editar/${nIdZona}`);
  }

  async fnCambiarEstado(zona: ZonaListado, bEstado: boolean): Promise<void> {
    const confirmacion = await Swal.fire({
      title: bEstado ? '¿Desea activar la zona?' : '¿Desea dar de baja la zona?',
      text: zona.sNombre,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    this.zonaService.cambiarEstado(zona.nIdZona, bEstado).subscribe(
      (respuesta: RespuestaApi) => {
        if (respuesta.cod === '1') {
          Swal.fire({ title: respuesta.mensaje, icon: 'success', timer: 3000 });
          this.fnGetZonas();
        } else {
          Swal.fire({ title: 'No se pudo completar', text: respuesta.mensaje, icon: 'error' });
        }
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        Swal.fire({
          title: 'No se pudo completar',
          text: ZonaService.fnMensajeError(error, 'Error de comunicación con el servidor.'),
          icon: 'error'
        });
      }
    );
  }

  fnGetZonas(): void {
    this.zonaService.getZonas().subscribe(
      (zonas: ZonaListado[]) => this.lZonas = zonas,
      (error: HttpErrorResponse) => console.error(error)
    );
  }
}
