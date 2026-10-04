import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import {
  AccionModal,
  AlmacenCombo,
  CategoriaCombo,
  DatosModal,
  ParametroApi,
  ProductoDetalle,
  RespuestaApi,
  UnidadMedidaCombo
} from 'src/app/shared/models';
import { APP_DATE_FORMATS, AppDateAdapter } from 'src/app/shared/services/AppDateAdapter';
import { InventarioService } from '../../inventario.service';
import { ConfiguracionService } from 'src/app/shared/services/configuracion.service';

interface EventoFecha {
  value: Date;
}

@Component({
  selector: 'app-productos-modal',
  templateUrl: './productos-modal.component.html',
  styleUrls: ['./productos-modal.component.css'],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
  ]
})
export class ProductosModalComponent implements OnInit {
  nIdCatProd: number = 0;
  nIdProducto: number = 0;
  bEsAlta: boolean = true;
  formProducto: UntypedFormGroup;
  sAccionModal: string;
  lAlmacenes: AlmacenCombo[] = [];
  lCategorias: CategoriaCombo[] = [];
  lUnidadMedida: UnidadMedidaCombo[] = [];
  dFechaFab: string = '';
  dFechaVenc: string = '';

  constructor(
    public dialogRef: MatDialogRef<ProductosModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DatosModal,
    private inventarioService: InventarioService,
    private formBuilder: UntypedFormBuilder,
    public configuracionService: ConfiguracionService,
  ) { }

  ngOnInit(): void {
    this.bEsAlta = this.data.accion === AccionModal.Agregar;
    this.sAccionModal = this.bEsAlta ? 'Agregar' : 'Editar';
    this.formProducto = this.formBuilder.group({
      sNombreProducto: ['', [Validators.required, Validators.pattern(/^[^|]*$/)]],
      nIdAlmacen: [0, Validators.required],
      nIdCategoria: [0, Validators.required],
    });

    // El alta crea también el primer lote. La edición ya no toca cantidad, precio
    // ni fechas: eso pertenece al lote y se mantiene desde la pantalla de Lotes.
    if (this.bEsAlta) {
      this.formProducto.addControl('nIdUnidadMedida', this.formBuilder.control(0, Validators.required));
      this.formProducto.addControl('nCantidad', this.formBuilder.control(0, Validators.required));
      this.formProducto.addControl('nPrecio', this.formBuilder.control(0, Validators.required));
      this.formProducto.addControl('dFechaFab', this.formBuilder.control('', Validators.required));
      this.formProducto.addControl('dFechaVenc', this.formBuilder.control('', Validators.required));
      this.formProducto.addControl('sDescripcion',
        this.formBuilder.control('', [Validators.required, Validators.pattern(/^[^|]*$/)]));

      this.fnListarUnidadMedida();
    }

    this.fnListarAlmacenes();
    this.fnListarCategorias();

    if (!this.bEsAlta) {
      this.nIdCatProd = this.data.nId;
      this.fnCargarDatos();
    }
  }

  fnCerrarModal(result: number): void {
    this.dialogRef.close(result === 1 ? result : undefined);
  }

  async fnCargarDatos(): Promise<void> {
    try {
      const productos = await this.inventarioService.fnServProducto<ProductoDetalle[]>(
        '05',
        [this.nIdCatProd]
      );

      if (!productos.length) {
        await Swal.fire({ title: 'No se encontró el producto', icon: 'error' });
        this.fnCerrarModal(0);
        return;
      }

      const producto = productos[0];
      this.nIdProducto = producto.nIdProducto;
      this.formProducto.patchValue(producto);
    } catch (error) {
      console.error(error as HttpErrorResponse);
    }
  }

  async fnListarAlmacenes(): Promise<void> {
    try {
      this.lAlmacenes = await this.inventarioService.fnServProducto<AlmacenCombo[]>('01', []);
    } catch (error) {
      console.error(error as HttpErrorResponse);
    }
  }

  async fnListarCategorias(): Promise<void> {
    try {
      this.lCategorias = await this.inventarioService.fnServProducto<CategoriaCombo[]>('02', []);
    } catch (error) {
      console.error(error as HttpErrorResponse);
    }
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
    if (this.formProducto.invalid) {
      await Swal.fire({ title: 'Ingrese todos los campos.', icon: 'warning', timer: 1500 });
      return;
    }

    if (this.bEsAlta && !this.fnValidarNum()) {
      return;
    }

    // Opción 06: producto, ubicación y primer lote. Opción 07: solo el producto y
    // su ubicación; el id del producto va en la posición 4 y el de TBL_CAT_PROD en la 5.
    const parametros: ParametroApi[] = this.bEsAlta
      ? [
        this.formProducto.get('sNombreProducto').value,
        this.formProducto.get('nIdAlmacen').value,
        this.formProducto.get('nIdCategoria').value,
        this.formProducto.get('nIdUnidadMedida').value,
        this.formProducto.get('nCantidad').value,
        this.formProducto.get('nPrecio').value,
        this.dFechaFab,
        this.dFechaVenc,
        this.formProducto.get('sDescripcion').value,
      ]
      : [
        this.formProducto.get('sNombreProducto').value,
        this.formProducto.get('nIdAlmacen').value,
        this.formProducto.get('nIdCategoria').value,
        this.nIdProducto,
        this.nIdCatProd,
      ];

    try {
      const respuesta = await this.inventarioService
        .fnServProducto<RespuestaApi>(this.bEsAlta ? '06' : '07', parametros);

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

  fnCambiarFecha(event: EventoFecha, nTipo: number): void {
    const fecha = this.fnFechaIso(event.value);

    if (nTipo === 1) {
      this.dFechaFab = fecha;
    } else if (nTipo === 2) {
      this.dFechaVenc = fecha;
    }
  }

  fnValidarNum(): boolean {
    const cantidad = Number(this.formProducto.controls.nCantidad.value);
    const precio = Number(this.formProducto.controls.nPrecio.value);
    const valido = cantidad > 0 && precio > 0;

    if (!valido) {
      Swal.fire({ title: 'La cantidad y el precio deben ser mayores que cero.', icon: 'warning', timer: 1500 });
    } else if (!Number.isInteger(cantidad)) {
      Swal.fire({ title: 'La cantidad debe ser un número entero.', icon: 'warning', timer: 1500 });
      return false;
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
