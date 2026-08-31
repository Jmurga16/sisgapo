import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  formProducto: FormGroup;
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
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.sAccionModal = this.data.accion === AccionModal.Agregar ? 'Agregar' : 'Editar';
    this.formProducto = this.formBuilder.group({
      sNombreProducto: ['', Validators.required],
      nIdAlmacen: [0, Validators.required],
      nIdCategoria: [0, Validators.required],
      nIdUnidadMedida: [0, Validators.required],
      nCantidad: [0, Validators.required],
      nPrecio: [0, Validators.required],
      dFechaFab: ['', Validators.required],
      dFechaVenc: ['', Validators.required],
      sDescripcion: ['', Validators.required],
    });

    this.fnListarAlmacenes();
    this.fnListarCategorias();
    this.fnListarUnidadMedida();

    if (this.data.accion === AccionModal.Editar) {
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
      this.dFechaFab = producto.dFechaFab;
      this.dFechaVenc = producto.dFechaVenc;
      this.formProducto.patchValue({
        ...producto,
        dFechaFab: this.fnTextoAFecha(producto.dFechaFab),
        dFechaVenc: this.fnTextoAFecha(producto.dFechaVenc)
      });
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

    if (!this.fnValidarNum()) {
      return;
    }

    const opcion = this.data.accion === AccionModal.Agregar ? '06' : '07';
    const parametros: ParametroApi[] = [
      this.formProducto.get('sNombreProducto').value,
      this.formProducto.get('nIdAlmacen').value,
      this.formProducto.get('nIdCategoria').value,
      this.formProducto.get('nIdUnidadMedida').value,
      this.formProducto.get('nCantidad').value,
      this.formProducto.get('nPrecio').value,
      this.dFechaFab,
      this.dFechaVenc,
      this.formProducto.get('sDescripcion').value,
    ];

    // Opción 07: nIdProducto ocupa la posición 10 y nIdCatProd la 11.
    if (opcion === '07') {
      parametros.push(this.nIdProducto, this.nIdCatProd);
    }

    try {
      const respuesta = await this.inventarioService
        .fnServProducto<RespuestaApi>(opcion, parametros);

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
    const cantidad = Number(this.formProducto.controls.nCantidad.value);
    const precio = Number(this.formProducto.controls.nPrecio.value);
    const valido = cantidad > 0 && precio > 0;

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
