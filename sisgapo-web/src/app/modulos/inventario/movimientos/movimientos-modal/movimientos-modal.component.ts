import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
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


function fnLoteSeleccionado(control: AbstractControl): ValidationErrors | null {
  return control.value && typeof control.value === 'object' ? null : { seleccion: true };
}

@Component({
  selector: 'app-movimientos-modal',
  templateUrl: './movimientos-modal.component.html',
  styleUrls: ['./movimientos-modal.component.css']
})
export class MovimientosModalComponent implements OnInit {
  formMovimiento: FormGroup;
  lLotes: LoteCombo[] = [];
  lLotesFiltrados: LoteCombo[] = [];

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
      oLote: [null, fnLoteSeleccionado],
      sTipo: ['E', Validators.required],
      nCantidad: [0, Validators.required],
      sMotivo: ['', [Validators.required, Validators.pattern(/^[^|]*$/)]],
    });

    this.formMovimiento.get('oLote').valueChanges
      .subscribe(valor => this.fnFiltrarLotes(valor));

    this.fnListarLotes();
  }

  fnCerrarModal(result: number): void {
    this.dialogRef.close(result === 1 ? result : undefined);
  }

  get sTipo(): TipoMovimiento {
    return this.formMovimiento.get('sTipo').value as TipoMovimiento;
  }

  get oLote(): LoteCombo | undefined {
    const valor = this.formMovimiento.get('oLote').value;
    return valor && typeof valor === 'object' ? valor as LoteCombo : undefined;
  }

  //El ajuste no recibe la diferencia sino la cantidad contada: el procedimiento
  //calcula el delta y el kardex lo muestra como entrada o salida.
  get sRotuloCantidad(): string {
    return this.sTipo === 'A' ? 'Cantidad contada' : 'Cantidad';
  }

  get nCantidadIngresada(): number {
    return Number(this.formMovimiento.get('nCantidad').value) || 0;
  }

  get nSaldoResultante(): number {
    const lote = this.oLote;

    if (!lote) {
      return 0;
    }

    if (this.sTipo === 'A') {
      return this.nCantidadIngresada;
    }

    if (this.sTipo === 'S') {
      return lote.nCantidad - this.nCantidadIngresada;
    }

    return lote.nCantidad + this.nCantidadIngresada;
  }

  get nDelta(): number {
    const lote = this.oLote;
    return lote ? this.nSaldoResultante - lote.nCantidad : 0;
  }

  get sDelta(): string {
    return `${this.nDelta > 0 ? '+' : ''}${this.nDelta}`;
  }

  get bSalidaExcede(): boolean {
    const lote = this.oLote;
    return !!lote && this.sTipo === 'S' && this.nCantidadIngresada > lote.nCantidad;
  }

  get bAjusteSinCambio(): boolean {
    const lote = this.oLote;
    return !!lote && this.sTipo === 'A' && this.nCantidadIngresada === lote.nCantidad;
  }

  async fnListarLotes(): Promise<void> {
    try {
      this.lLotes = await this.inventarioService.fnServMovimiento<LoteCombo[]>('03', [0, 0]);
      this.lLotesFiltrados = this.lLotes;

      const nIdDetProd = this.data && this.data.nIdDetProd ? this.data.nIdDetProd : 0;
      const lote = this.lLotes.filter(opc => opc.nIdDetProd === nIdDetProd)[0];

      if (lote) {
        this.formMovimiento.get('oLote').setValue(lote);
      }
    } catch (error) {
      console.error(error as HttpErrorResponse);
    }
  }

  fnMostrarLote = (lote: LoteCombo): string => {
    return lote ? `${lote.sNombreLote} — ${lote.sNombreProducto}` : '';
  }

  fnFiltrarLotes(valor: LoteCombo | string): void {
    const sTexto = typeof valor === 'string' ? valor.trim().toLowerCase() : '';

    this.lLotesFiltrados = sTexto
      ? this.lLotes.filter(opc =>
        `${opc.sNombreLote} ${opc.sNombreProducto} ${opc.sNombreAlmacen}`
          .toLowerCase().indexOf(sTexto) !== -1)
      : this.lLotes;
  }

  async fnGrabar(): Promise<void> {
    if (this.formMovimiento.invalid) {
      this.formMovimiento.markAllAsTouched();
      await Swal.fire({ title: 'Ingrese todos los campos.', icon: 'warning', timer: 1500 });
      return;
    }

    const nCantidad = Number(this.formMovimiento.get('nCantidad').value);

    if (nCantidad < 0 || (this.sTipo !== 'A' && nCantidad <= 0)) {
      await Swal.fire({ title: 'La cantidad debe ser mayor que cero.', icon: 'warning', timer: 1500 });
      return;
    }

    const parametros: ParametroApi[] = [
      this.oLote.nIdDetProd,
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
