import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import {
  AccionModal,
  CategoriaDetalle,
  DatosModal,
  ParametroApi,
  RespuestaApi
} from 'src/app/shared/models';
import { InventarioService } from '../../inventario.service';

@Component({
  selector: 'app-categoria-modal',
  templateUrl: './categoria-modal.component.html',
  styleUrls: ['./categoria-modal.component.css']
})
export class CategoriaModalComponent implements OnInit {
  nIdCategoria: number = 0;
  formCategoria: FormGroup;
  sAccionModal: string;
  bGuardando: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<CategoriaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DatosModal,
    private inventarioService: InventarioService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.sAccionModal = this.data.accion === AccionModal.Agregar ? 'Agregar' : 'Editar';
    this.formCategoria = this.formBuilder.group({
      sNombre: ['', [Validators.required, Validators.maxLength(100)]],
      sDescripcion: ['', [Validators.required, Validators.maxLength(250)]],
    });

    if (this.data.accion === AccionModal.Editar) {
      this.nIdCategoria = this.data.nId;
      this.fnCargarDatos();
    }
  }

  async fnGrabar(): Promise<void> {
    const nombre = String(this.formCategoria.get('sNombre').value || '').trim();
    const descripcion = String(this.formCategoria.get('sDescripcion').value || '').trim();

    if (this.formCategoria.invalid || !nombre || !descripcion) {
      this.formCategoria.markAllAsTouched();
      await Swal.fire({ title: 'Ingrese todos los campos.', icon: 'warning', timer: 1500 });
      return;
    }

    const opcion = this.data.accion === AccionModal.Agregar ? '03' : '04';
    const parametros: ParametroApi[] = [
      nombre,
      descripcion
    ];

    if (opcion === '04') {
      parametros.push(this.nIdCategoria);
    }

    this.bGuardando = true;

    try {
      const respuesta = await this.inventarioService
        .fnServCategoria<RespuestaApi>(opcion, parametros);

      if (respuesta.cod === '1') {
        await Swal.fire({ title: respuesta.mensaje, icon: 'success', timer: 3500 });
        this.fnCerrarModal(1);
      } else {
        await Swal.fire({ title: 'No se pudo guardar', text: respuesta.mensaje, icon: 'error' });
      }
    } catch (error) {
      const httpError = error as HttpErrorResponse;
      console.error(httpError);
      await Swal.fire({
        title: 'No se pudo guardar',
        text: httpError.error && httpError.error.mensaje
          ? httpError.error.mensaje
          : 'Error de comunicación con el servidor.',
        icon: 'error'
      });
    } finally {
      this.bGuardando = false;
    }
  }

  async fnCargarDatos(): Promise<void> {
    try {
      const categorias = await this.inventarioService.fnServCategoria<CategoriaDetalle[]>(
        '02',
        [this.nIdCategoria]
      );

      if (!categorias.length) {
        await Swal.fire({ title: 'No se encontró la categoría', icon: 'error' });
        this.fnCerrarModal(0);
        return;
      }

      this.formCategoria.patchValue(categorias[0]);
    } catch (error) {
      console.error(error as HttpErrorResponse);
    }
  }

  fnCerrarModal(result: number): void {
    this.dialogRef.close(result === 1 ? result : undefined);
  }
}
