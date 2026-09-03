import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { RespuestaApi, ZonaGuardar, ZonaListado } from 'src/app/shared/models';
import { ZonaService } from '../zona.service';
import { ConfiguracionService } from 'src/app/shared/services/configuracion.service';

@Component({
  selector: 'app-zona-form',
  templateUrl: './zona-form.component.html',
  styleUrls: ['./zona-form.component.css']
})
export class ZonaFormComponent implements OnInit {
  sTitulo: string = 'Agregar zona';
  sRutaImagen: string;
  nIdZona: number = 0;
  bEditar: boolean = false;
  readonly urlNoImagen: string = '../../../../assets/no-image.png';

  fNombre = new FormControl();
  fRutaImagen = new FormControl();

  constructor(
    private zonaService: ZonaService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public configuracionService: ConfiguracionService,
  ) { }

  ngOnInit(): void {
    this.sRutaImagen = this.urlNoImagen;
    const nIdZona = Number(this.activatedRoute.snapshot.params.id);

    if (!nIdZona) {
      return;
    }

    this.nIdZona = nIdZona;
    this.sTitulo = 'Editar zona';
    this.bEditar = true;
    this.zonaService.getOne(nIdZona).subscribe(
      (zonas: ZonaListado[]) => {
        if (!zonas.length) {
          Swal.fire({ title: 'No se encontró la zona', icon: 'error' });
          return;
        }

        const zona = zonas[0];
        this.fNombre.setValue(zona.sNombre);
        this.fRutaImagen.setValue(zona.sRutaImagen);
        this.sRutaImagen = zona.sRutaImagen || this.urlNoImagen;
      },
      (error: HttpErrorResponse) => console.error(error)
    );
  }

  async fnSaveNewZona(): Promise<void> {
    if (!this.fNombre.value) {
      await Swal.fire({ title: 'Complete el campo Nombre.', icon: 'warning', timer: 3500 });
      return;
    }

    if (!this.fRutaImagen.value) {
      await Swal.fire({ title: 'Complete el campo Ruta de Imagen.', icon: 'warning', timer: 3500 });
      return;
    }

    if (!this.fnValidarImagen()) {
      return;
    }

    const zona: ZonaGuardar = {
      nIdZona: this.bEditar ? this.nIdZona : 0,
      sNombre: this.fNombre.value,
      sRutaImagen: this.fRutaImagen.value
    };
    const peticion = this.bEditar
      ? this.zonaService.updateZona(zona)
      : this.zonaService.saveZona(zona);

    peticion.subscribe(
      (respuesta: RespuestaApi) => {
        if (respuesta.cod === '1') {
          Swal.fire({ title: respuesta.mensaje, icon: 'success', timer: 3000 })
            .then(() => this.router.navigate(['/', 'zonas']));
        } else {
          Swal.fire({ title: 'No se pudo guardar', text: respuesta.mensaje, icon: 'error' });
        }
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        Swal.fire({
          title: 'No se pudo guardar',
          text: ZonaService.fnMensajeError(error, 'Error de comunicación con el servidor.'),
          icon: 'error'
        });
      }
    );
  }

  changeImagen(): void {
    if (!this.fRutaImagen.value) {
      this.sRutaImagen = this.urlNoImagen;
      return;
    }

    this.sRutaImagen = this.fRutaImagen.value;
    this.fnValidarImagen();
  }

  fnValidarImagen(): boolean {
    const valor = String(this.fRutaImagen.value || '').trim();
    const ruta = valor.split(/[?#]/)[0].toLowerCase();
    const extension = ruta.match(/\.([a-z0-9]+)$/);
    const bValido = /^https?:\/\/\S+$/.test(valor)
      && (!extension || /^(png|jpe?g|webp)$/.test(extension[1]));

    if (!bValido) {
      this.fRutaImagen.setValue('');
      this.sRutaImagen = this.urlNoImagen;
      Swal.fire({ title: 'Formato de imagen no válido.', icon: 'warning', timer: 3500 });
    }

    return bValido;
  }
}
