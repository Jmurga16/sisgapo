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

  constructor(
    public dialogRef: MatDialogRef<CategoriaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DatosModal,
    private inventarioService: InventarioService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.sAccionModal = this.data.accion === AccionModal.Agregar ? 'Agregar' : 'Editar';
    this.formCategoria = this.formBuilder.group({
      sNombre: ['', Validators.required],
      sDescripcion: ['', Validators.required],
    });

    if (this.data.accion === AccionModal.Editar) {
      this.nIdCategoria = this.data.nId;
      this.fnCargarDatos();
    }
  }

  async fnGrabar(): Promise<void> {
    if (this.formCategoria.invalid) {
      await Swal.fire({ title: 'Ingrese todos los campos.', icon: 'warning', timer: 1500 });
      return;
    }

    const opcion = this.data.accion === AccionModal.Agregar ? '03' : '04';
    const parametros: ParametroApi[] = [
      this.formCategoria.get('sNombre').value,
      this.formCategoria.get('sDescripcion').value
    ];

    if (opcion === '04') {
      parametros.push(this.nIdCategoria);
    }

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
      console.error(error as HttpErrorResponse);
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
