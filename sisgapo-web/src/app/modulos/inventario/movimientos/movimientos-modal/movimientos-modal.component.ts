import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import {
  LoteCombo,
  ParametroApi,
  RespuestaApi,
  TipoMovimiento
} from 'src/app/shared/models';
import { InventarioService } from '../../inventario.service';
import { ConfiguracionService } from 'src/app/shared/services/configuracion.service';
import { SesionService } from 'src/app/shared/services/sesion.service';

export interface DatosMovimiento {
  nIdDetProd: number;
}

@Component({
  selector: 'app-movimientos-modal',
  templateUrl: './movimientos-modal.component.html',
  styleUrls: ['./movimientos-modal.component.css']
})
export class MovimientosModalComponent implements OnInit {
  formMovimiento: FormGroup;
  lLotes: LoteCombo[] = [];

  constructor(
    public dialogRef: MatDialogRef<MovimientosModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DatosMovimiento,
    private inventarioService: InventarioService,
    private formBuilder: FormBuilder,
    public configuracionService: ConfiguracionService,
    public sesionService: SesionService,
  ) { }

  ngOnInit(): void {
    this.formMovimiento = this.formBuilder.group({
      nIdDetProd: [this.data && this.data.nIdDetProd ? this.data.nIdDetProd : 0, Validators.required],
      sTipo: ['E', Validators.required],
      nCantidad: [0, Validators.required],
      sMotivo: ['', [Validators.required, Validators.pattern(/^[^|]*$/)]],
    });

    this.fnListarLotes();
  }

  fnCerrarModal(result: number): void {
    this.dialogRef.close(result === 1 ? result : undefined);
  }

  get sTipo(): TipoMovimiento {
    return this.formMovimiento.get('sTipo').value as TipoMovimiento;
  }

  get oLote(): LoteCombo | undefined {
    const nIdDetProd = Number(this.formMovimiento.get('nIdDetProd').value);
    return this.lLotes.filter(lote => lote.nIdDetProd === nIdDetProd)[0];
  }

  //El ajuste no recibe la diferencia sino la cantidad contada: el procedimiento
  //calcula el delta y el kardex lo muestra como entrada o salida.
  get sRotuloCantidad(): string {
    return this.sTipo === 'A' ? 'Cantidad contada' : 'Cantidad';
  }

  async fnListarLotes(): Promise<void> {
    try {
      this.lLotes = await this.inventarioService.fnServMovimiento<LoteCombo[]>('03', [0, 0]);
    } catch (error) {
      console.error(error as HttpErrorResponse);
    }
  }

  async fnGrabar(): Promise<void> {
    if (this.formMovimiento.invalid) {
      await Swal.fire({ title: 'Ingrese todos los campos.', icon: 'warning', timer: 1500 });
      return;
    }

    const nCantidad = Number(this.formMovimiento.get('nCantidad').value);

    if (nCantidad < 0 || (this.sTipo !== 'A' && nCantidad <= 0)) {
      await Swal.fire({ title: 'La cantidad debe ser mayor que cero.', icon: 'warning', timer: 1500 });
      return;
    }

    const parametros: ParametroApi[] = [
      this.formMovimiento.get('nIdDetProd').value,
      this.formMovimiento.get('sTipo').value,
      nCantidad,
      this.formMovimiento.get('sMotivo').value,
    ];

    try {
      const respuesta = await this.inventarioService
        .fnServMovimiento<RespuestaApi>('02', parametros);

      if (respuesta.cod === '1') {
        await Swal.fire({ title: respuesta.mensaje, icon: 'success', timer: 3500 });
        this.fnCerrarModal(1);
      } else {
        await Swal.fire({ title: 'No se pudo registrar', text: respuesta.mensaje, icon: 'error' });
      }
    } catch (error) {
      const httpError = error as HttpErrorResponse;
      console.error(httpError);
      await Swal.fire({
        title: 'No se pudo registrar',
        text: httpError.error && httpError.error.mensaje
          ? httpError.error.mensaje
          : 'Error de comunicación con el servidor.',
        icon: 'error'
      });
    }
  }
}
