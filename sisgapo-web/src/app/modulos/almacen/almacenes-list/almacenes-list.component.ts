import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import {
  AccionModal,
  AlmacenListado,
  DatosModal,
  ParametroApi,
  RespuestaApi,
  ValorEstado
} from 'src/app/shared/models';
import { AlmacenesModalComponent } from '../almacenes-modal/almacenes-modal.component';
import { AlmacenesService } from '../almacenes.service';
import { ConfiguracionService } from 'src/app/shared/services/configuracion.service';

@Component({
  selector: 'app-almacenes-list',
  templateUrl: './almacenes-list.component.html',
  styleUrls: ['./almacenes-list.component.css'],
})
export class AlmacenesListComponent implements OnInit, AfterViewInit {
  readonly appName: string = 'Almacenes';
  readonly displayedColumns: string[] = [
    'nIdAlmacen',
    'sNombreZona',
    'sNombreAlmacen',
    'sEstado',
    'Acciones',
  ];

  dsAlmacenes = new MatTableDataSource<AlmacenListado>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private almacenesService: AlmacenesService,
    public configuracionService: ConfiguracionService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.fnListarAlmacenes();
  }

  ngAfterViewInit(): void {
    this.dsAlmacenes.paginator = this.paginator;
    this.dsAlmacenes.sort = this.sort;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dsAlmacenes.filter = filterValue.trim().toLowerCase();

    if (this.dsAlmacenes.paginator) {
      this.dsAlmacenes.paginator.firstPage();
    }
  }

  fnLimpiarFiltro(input: HTMLInputElement): void {
    input.value = '';
    this.dsAlmacenes.filter = '';

    if (this.dsAlmacenes.paginator) {
      this.dsAlmacenes.paginator.firstPage();
    }
  }

  fnAbrirModal(accion: AccionModal, nIdAlmacen: number): void {
    const datos: DatosModal = { accion, nId: nIdAlmacen };
    const dialogRef = this.dialog.open(AlmacenesModalComponent, {
      width: '50rem',
      maxWidth: '95vw',
      disableClose: true,
      data: datos,
    });

    dialogRef.afterClosed().subscribe((result: number | undefined) => {
      if (result !== undefined) {
        this.fnListarAlmacenes();
      }
    });
  }

  async fnListarAlmacenes(): Promise<void> {
    try {
      const parametros: ParametroApi[] = [];
      this.dsAlmacenes.data = await this.almacenesService
        .fnServAlmacenes<AlmacenListado[]>('01', parametros);
    } catch (error) {
      console.error(error);
    }
  }

  async fnCambiarEstado(nIdAlmacen: number, estado: ValorEstado): Promise<void> {
    const sTitulo = estado === ValorEstado.Inactivo
      ? '¿Desea desactivar el almacén?'
      : '¿Desea activar el almacén?';
    const confirmacion = await Swal.fire({
      title: sTitulo,
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

    try {
      // Opción 07: activa o desactiva el almacén.
      const respuesta = await this.almacenesService.fnServAlmacenes<RespuestaApi>(
        '07',
        [nIdAlmacen, estado]
      );

      if (respuesta.cod === '1') {
        const mensaje = estado === ValorEstado.Activo
          ? 'Se activó el almacén con éxito'
          : 'Se desactivó el almacén con éxito';
        await Swal.fire({ title: mensaje, icon: 'success', timer: 3500 });
      } else {
        await Swal.fire({
          title: 'No se pudo cambiar el estado',
          text: respuesta.mensaje,
          icon: 'error'
        });
      }

      await this.fnListarAlmacenes();
    } catch (error) {
      console.error(error as HttpErrorResponse);
      await Swal.fire({
        title: 'No se pudo cambiar el estado',
        text: 'Error de comunicación con el servidor.',
        icon: 'error'
      });
    }
  }
}
