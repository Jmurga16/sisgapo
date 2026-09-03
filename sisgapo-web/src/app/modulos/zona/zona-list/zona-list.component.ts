import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { RespuestaApi, ZonaListado } from 'src/app/shared/models';
import { ZonaService } from '../zona.service';
import { ConfiguracionService } from 'src/app/shared/services/configuracion.service';
import { SesionService } from 'src/app/shared/services/sesion.service';

@Component({
  selector: 'app-zona-list',
  templateUrl: './zona-list.component.html',
  styleUrls: ['./zona-list.component.css']
})
export class ZonaListComponent implements OnInit {
  lZonas: ZonaListado[] = [];
  bCargando: boolean = true;
  sError: string = '';

  constructor(
    private zonaService: ZonaService,
    public configuracionService: ConfiguracionService,
    public sesionService: SesionService,
    private router: Router
  ) { }

  get bPuedeMantener(): boolean {
    return this.sesionService.fnEsAdministrador() && !this.configuracionService.bDemoSoloLectura;
  }

  ngOnInit(): void {
    this.fnGetZonas();
  }

  fnVerZona(nIdZona: number): void {
    this.router.navigateByUrl(`zonas/editar/${nIdZona}`);
  }

  async fnCambiarEstado(zona: ZonaListado, bEstado: boolean): Promise<void> {
    const confirmacion = await Swal.fire({
      title: bEstado ? '¿Desea activar la zona?' : '¿Desea desactivar la zona?',
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
          const mensaje = bEstado
            ? 'Se activó la zona con éxito'
            : 'Se desactivó la zona con éxito';
          Swal.fire({ title: mensaje, icon: 'success', timer: 3000 });
          this.fnGetZonas();
        } else {
          const mensaje = respuesta.mensaje.replace('dar de baja', 'desactivar');
          Swal.fire({ title: 'No se pudo completar', text: mensaje, icon: 'error' });
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
    this.bCargando = true;
    this.sError = '';

    this.zonaService.getZonas().subscribe(
      (zonas: ZonaListado[]) => {
        this.lZonas = zonas;
        this.bCargando = false;
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this.sError = ZonaService.fnMensajeError(error, 'No se pudieron cargar las zonas.');
        this.bCargando = false;
      }
    );
  }
}
