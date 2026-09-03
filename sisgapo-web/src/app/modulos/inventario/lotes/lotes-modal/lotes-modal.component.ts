import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import {
  AccionModal,
  DatosModal,
  LoteDetalle,
  ParametroApi,
  ProductoCombo,
  RespuestaApi,
  UnidadMedidaCombo
} from 'src/app/shared/models';
import { APP_DATE_FORMATS, AppDateAdapter } from 'src/app/shared/services/AppDateAdapter';
import { InventarioService } from '../../inventario.service';
import { ConfiguracionService } from 'src/app/shared/services/configuracion.service';

interface EventoFecha {
  value: Date;
}

//El autocompletado guarda el objeto, no el id: mientras se escribe el control
//vale una cadena y hay que impedir que eso pase por una selección.
function fnProductoSeleccionado(control: AbstractControl): ValidationErrors | null {
  return control.value && typeof control.value === 'object' ? null : { seleccion: true };
}

@Component({
  selector: 'app-lotes-modal',
  templateUrl: './lotes-modal.component.html',
  styleUrls: ['./lotes-modal.component.css'],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
  ]
})
export class LotesModalComponent implements OnInit {
  nIdDetProd: number = 0;
  bEsAlta: boolean = true;
  formLote: FormGroup;
  sAccionModal: string;
  sNombreProducto: string = '';
  lProductos: ProductoCombo[] = [];
  lProductosFiltrados: ProductoCombo[] = [];
  lUnidadMedida: UnidadMedidaCombo[] = [];
  dFechaFab: string = '';
  dFechaVenc: string = '';

  constructor(
    public dialogRef: MatDialogRef<LotesModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DatosModal,
    private inventarioService: InventarioService,
    private formBuilder: FormBuilder,
    public configuracionService: ConfiguracionService,
  ) { }

  ngOnInit(): void {
    this.bEsAlta = this.data.accion === AccionModal.Agregar;
    this.sAccionModal = this.bEsAlta ? 'Agregar' : 'Editar';

    this.formLote = this.formBuilder.group({
      sNombreLote: ['', Validators.pattern(/^[^|]*$/)],
      dFechaFab: ['', Validators.required],
      dFechaVenc: ['', Validators.required],
      nIdUnidadMedida: [0, Validators.required],
      nPrecio: [0, Validators.required],
      sDescripcion: ['', [Validators.required, Validators.pattern(/^[^|]*$/)]],
    });

    // La cantidad solo existe en el alta: es la existencia con la que entra la
    // partida. A partir de ahí se mueve desde Movimientos.
    if (this.bEsAlta) {
      this.formLote.addControl('oProducto', this.formBuilder.control(null, fnProductoSeleccionado));
      this.formLote.addControl('nCantidad', this.formBuilder.control(0, Validators.required));

      this.formLote.get('oProducto').valueChanges
        .subscribe(valor => this.fnFiltrarProductos(valor));

      this.fnListarProductos();
    }

    this.fnListarUnidadMedida();

    if (!this.bEsAlta) {
      this.nIdDetProd = this.data.nId;
      this.fnCargarDatos();
    }
  }

  fnCerrarModal(result: number): void {
    this.dialogRef.close(result === 1 ? result : undefined);
  }

  async fnCargarDatos(): Promise<void> {
    try {
      const lotes = await this.inventarioService.fnServLote<LoteDetalle[]>(
        '02',
        [this.nIdDetProd]
      );

      if (!lotes.length) {
        await Swal.fire({ title: 'No se encontró el lote', icon: 'error' });
        this.fnCerrarModal(0);
        return;
      }

      const lote = lotes[0];
      this.sNombreProducto = lote.sNombreProducto;
      this.dFechaFab = lote.dFechaFab;
      this.dFechaVenc = lote.dFechaVenc;
      this.formLote.patchValue({
        sNombreLote: lote.sNombreLote,
        nIdUnidadMedida: lote.nIdUnidadMedida,
        nPrecio: lote.nPrecio,
        sDescripcion: lote.sDescripcion,
        dFechaFab: this.fnTextoAFecha(lote.dFechaFab),
        dFechaVenc: this.fnTextoAFecha(lote.dFechaVenc)
      });
    } catch (error) {
      console.error(error as HttpErrorResponse);
    }
  }

  async fnListarProductos(): Promise<void> {
    try {
      this.lProductos = await this.inventarioService.fnServLote<ProductoCombo[]>('06', [0]);
      this.lProductosFiltrados = this.lProductos;
    } catch (error) {
      console.error(error as HttpErrorResponse);
    }
  }

  fnMostrarProducto = (producto: ProductoCombo): string => {
    return producto ? `${producto.sNombreProducto} — ${producto.sNombreAlmacen}` : '';
  }

  //Se busca por producto y por almacén a la vez: el catálogo repite nombres entre
  //almacenes y el nombre suelto no basta para saber cuál es cuál.
  fnFiltrarProductos(valor: ProductoCombo | string): void {
    const sTexto = typeof valor === 'string' ? valor.trim().toLowerCase() : '';

    this.lProductosFiltrados = sTexto
      ? this.lProductos.filter(opc =>
        `${opc.sNombreProducto} ${opc.sNombreAlmacen}`.toLowerCase().indexOf(sTexto) !== -1)
      : this.lProductos;
  }

  async fnListarUnidadMedida(): Promise<void> {
    try {
      this.lUnidadMedida = await this.inventarioService
        .fnServProducto<UnidadMedidaCombo[]>('04', []);
    } catch (error) {
      console.error(error as HttpErrorResponse);
    }
  }

  async fnGrabar(): Promise<void> {
    if (this.formLote.invalid) {
      this.formLote.markAllAsTouched();
      await Swal.fire({ title: 'Ingrese todos los campos.', icon: 'warning', timer: 1500 });
      return;
    }

    if (!this.fnValidarNum()) {
      return;
    }

    const parametros: ParametroApi[] = this.bEsAlta
      ? [
        (this.formLote.get('oProducto').value as ProductoCombo).nIdProducto,
        this.formLote.get('sNombreLote').value,
        this.dFechaFab,
        this.dFechaVenc,
        this.formLote.get('nIdUnidadMedida').value,
        this.formLote.get('nCantidad').value,
        this.formLote.get('nPrecio').value,
        this.formLote.get('sDescripcion').value,
      ]
      : [
        this.nIdDetProd,
        this.formLote.get('sNombreLote').value,
        this.dFechaFab,
        this.dFechaVenc,
        this.formLote.get('nIdUnidadMedida').value,
        this.formLote.get('nPrecio').value,
        this.formLote.get('sDescripcion').value,
      ];

    try {
      const respuesta = await this.inventarioService
        .fnServLote<RespuestaApi>(this.bEsAlta ? '03' : '04', parametros);

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
    }
  }

  fnTextoAFecha(sFecha: string): Date {
    const partes = sFecha.substring(0, 10).split('-');
    return new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
  }

  fnCambiarFecha(event: EventoFecha, nTipo: number): void {
    const fecha = this.fnFechaIso(event.value);

    if (nTipo === 1) {
      this.dFechaFab = fecha;
    } else if (nTipo === 2) {
      this.dFechaVenc = fecha;
    }
  }

  fnValidarNum(): boolean {
    const precio = Number(this.formLote.get('nPrecio').value);
    const cantidad = this.bEsAlta ? Number(this.formLote.get('nCantidad').value) : 1;
    const valido = precio > 0 && cantidad > 0;

    if (!valido) {
      Swal.fire({ title: 'La cantidad y el precio deben ser mayores que cero.', icon: 'warning', timer: 1500 });
    }

    return valido;
  }

  private fnFechaIso(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }
}
