import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import {
  AccionModal,
  CategoriaListado,
  DatosModal,
  RespuestaApi,
  ValorEstado
} from 'src/app/shared/models';
import { InventarioService } from '../inventario.service';
import { CategoriaModalComponent } from './categoria-modal/categoria-modal.component';
import { ConfiguracionService } from 'src/app/shared/services/configuracion.service';
import { SesionService } from 'src/app/shared/services/sesion.service';

@Component({
  selector: 'app-categoria',
  templateUrl: './categoria.component.html',
  styleUrls: ['./categoria.component.css']
})
export class CategoriaComponent implements OnInit, AfterViewInit {
  readonly displayedColumns: string[] = [
    'nIdCategoria',
    'sNombre',
    'sDescripcion',
    'sEstado',
    'Acciones',
  ];
  dsCategoria = new MatTableDataSource<CategoriaListado>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private inventarioService: InventarioService,
    public configuracionService: ConfiguracionService,
    public sesionService: SesionService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.fnListarCategorias();
  }

  ngAfterViewInit(): void {
    this.dsCategoria.paginator = this.paginator;
    this.dsCategoria.sort = this.sort;
  }

  fnFiltrarTabla(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dsCategoria.filter = filterValue.trim().toLowerCase();

    if (this.dsCategoria.paginator) {
      this.dsCategoria.paginator.firstPage();
    }
  }

  fnLimpiarFiltro(input: HTMLInputElement): void {
    input.value = '';
    this.dsCategoria.filter = '';

    if (this.dsCategoria.paginator) {
      this.dsCategoria.paginator.firstPage();
    }
  }

  async fnListarCategorias(): Promise<void> {
    try {
      this.dsCategoria.data = await this.inventarioService
        .fnServCategoria<CategoriaListado[]>('01', []);
    } catch (error) {
      console.error(error as HttpErrorResponse);
    }
  }

  async fnCambiarEstado(nIdCategoria: number, estado: ValorEstado): Promise<void> {
    const activar = estado === ValorEstado.Activo;
    const confirmacion = await Swal.fire({
      title: activar ? '¿Desea activar la categoría?' : '¿Desea desactivar la categoría?',
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
      const respuesta = await this.inventarioService.fnServCategoria<RespuestaApi>(
        '05',
        [nIdCategoria, estado]
      );

      if (respuesta.cod === '1') {
        const mensaje = activar
          ? 'Se activó la categoría con éxito'
          : 'Se desactivó la categoría con éxito';
        await Swal.fire({ title: mensaje, icon: 'success', timer: 3500 });
      } else {
        await Swal.fire({ title: 'No se pudo cambiar el estado', text: respuesta.mensaje, icon: 'error' });
      }

      await this.fnListarCategorias();
    } catch (error) {
      console.error(error as HttpErrorResponse);
    }
  }

  fnAbrirModal(accion: AccionModal, nIdCategoria: number): void {
    const datos: DatosModal = { accion, nId: nIdCategoria };
    const dialogRef = this.dialog.open(CategoriaModalComponent, {
      width: '50rem',
      maxWidth: '95vw',
      disableClose: true,
      data: datos,
    });

    dialogRef.afterClosed().subscribe((result: number | undefined) => {
      if (result !== undefined) {
        this.fnListarCategorias();
      }
    });
  }
}
