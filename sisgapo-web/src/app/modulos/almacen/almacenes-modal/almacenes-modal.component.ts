import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import {
  AccionModal,
  AlmacenDetalle,
  DatosModal,
  ParametroApi,
  RespuestaApi,
  SupervisorCombo,
  ZonaCombo
} from 'src/app/shared/models';
import { AlmacenesService } from '../almacenes.service';

@Component({
  selector: 'app-almacenes-modal',
  templateUrl: './almacenes-modal.component.html',
  styleUrls: ['./almacenes-modal.component.css']
})
export class AlmacenesModalComponent implements OnInit {
  nIdAlmacen: number = 0;
  formAlmacen: FormGroup;
  sAccionModal: string;
  lZonas: ZonaCombo[] = [];
  lSupervisores: SupervisorCombo[] = [];

  constructor(
    public dialogRef: MatDialogRef<AlmacenesModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DatosModal,
    private almacenesService: AlmacenesService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.sAccionModal = this.data.accion === AccionModal.Agregar ? 'Agregar' : 'Editar';
    this.formAlmacen = this.formBuilder.group({
      sNombreAlmacen: ['', Validators.required],
      sDireccion: ['', Validators.required],
      nIdZona: ['', Validators.required],
      nIdSupervisor: ['', Validators.required],
    });

    this.fnListarZonas();
    this.fnListarSupervisor();

    if (this.data.accion === AccionModal.Editar) {
      this.nIdAlmacen = this.data.nId;
      this.fnCargarDatos();
    }
  }

  fnCerrarModal(result: number): void {
    this.dialogRef.close(result === 1 ? result : undefined);
  }

  async fnListarZonas(): Promise<void> {
    try {
      this.lZonas = await this.almacenesService
        .fnServAlmacenes<ZonaCombo[]>('03', []);
    } catch (error) {
      console.error(error as HttpErrorResponse);
    }
  }

  async fnListarSupervisor(): Promise<void> {
    try {
      this.lSupervisores = await this.almacenesService
        .fnServAlmacenes<SupervisorCombo[]>('04', []);
    } catch (error) {
      console.error(error as HttpErrorResponse);
    }
  }

  async fnCargarDatos(): Promise<void> {
    try {
      const almacenes = await this.almacenesService.fnServAlmacenes<AlmacenDetalle[]>(
        '02',
        [this.nIdAlmacen]
      );

      if (!almacenes.length) {
        await Swal.fire({ title: 'No se encontró el almacén', icon: 'error' });
        this.fnCerrarModal(0);
        return;
      }

      const almacen = almacenes[0];
      this.formAlmacen.patchValue({
        sNombreAlmacen: almacen.sNombre,
        sDireccion: almacen.sDireccion,
        nIdZona: almacen.nIdZona,
        nIdSupervisor: almacen.nIdSupervisor
      });
    } catch (error) {
      console.error(error as HttpErrorResponse);
    }
  }

  async fnGrabar(): Promise<void> {
    if (this.formAlmacen.invalid) {
      await Swal.fire({ title: 'Ingrese todos los campos.', icon: 'warning', timer: 1500 });
      return;
    }

    const opcion = this.data.accion === AccionModal.Agregar ? '05' : '06';
    const parametros: ParametroApi[] = [
      this.formAlmacen.get('sNombreAlmacen').value,
      this.formAlmacen.get('sDireccion').value,
      this.formAlmacen.get('nIdSupervisor').value,
      this.formAlmacen.get('nIdZona').value,
    ];

    if (opcion === '06') {
      parametros.push(this.nIdAlmacen);
    }

    try {
      const respuesta = await this.almacenesService
        .fnServAlmacenes<RespuestaApi>(opcion, parametros);

      if (respuesta.cod === '1') {
        await Swal.fire({ title: respuesta.mensaje, icon: 'success', timer: 3500 });
        this.fnCerrarModal(1);
      } else {
        await Swal.fire({ title: 'No se pudo guardar', text: respuesta.mensaje, icon: 'error' });
      }
    } catch (error) {
      console.error(error as HttpErrorResponse);
      await Swal.fire({
        title: 'No se pudo guardar',
        text: 'Error de comunicación con el servidor.',
        icon: 'error'
      });
    }
  }
}
