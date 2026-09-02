import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import {
  AccionModal,
  DatosModal,
  GeneroOpcion,
  ListaOpcion,
  ParametroApi,
  RespuestaUsuarios,
  UsuarioDetalle
} from 'src/app/shared/models';
import { APP_DATE_FORMATS, AppDateAdapter } from 'src/app/shared/services/AppDateAdapter';
import { UsuariosService } from '../usuarios.service';

interface EventoFecha {
  value: Date;
}

@Component({
  selector: 'app-usuarios-modal',
  templateUrl: './usuarios-modal.component.html',
  styleUrls: ['./usuarios-modal.component.css'],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
  ]
})
export class UsuariosModalComponent implements OnInit {
  nIdUsuario: number = 0;
  formUsuario: FormGroup;
  sAccionModal: string;
  dFechaNacimiento: string = '';
  dFechaHoy: Date = new Date();

  readonly lDocumentos: ListaOpcion[] = [
    { valor: 1, nombre: 'DNI' },
    { valor: 2, nombre: 'Carnet Ext.' },
  ];
  readonly lRoles: ListaOpcion[] = [
    { valor: 2, nombre: 'Supervisor' },
    { valor: 3, nombre: 'Asistente' },
  ];
  readonly lSexo: GeneroOpcion[] = [
    { abrev: 'M', nombre: 'Masculino' },
    { abrev: 'F', nombre: 'Femenino' },
  ];

  bEsAlta: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<UsuariosModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DatosModal,
    private usuariosService: UsuariosService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.bEsAlta = this.data.accion === AccionModal.Agregar;
    this.sAccionModal = this.bEsAlta ? 'Agregar' : 'Editar';
    this.formUsuario = this.formBuilder.group({
      sNombres: ['', Validators.required],
      sApellidos: ['', Validators.required],
      nTipoDoc: ['', Validators.required],
      sNumDoc: ['', Validators.required],
      sSexo: ['', Validators.required],
      nIdRol: ['', Validators.required],
      sDireccion: ['', Validators.required],
      nTelefono: ['', Validators.required],
      dFechaNacimiento: ['', Validators.required],
      //En edicion es opcional: en blanco significa dejar la contrasenia como esta.
      sContrasenia: ['', this.bEsAlta ? Validators.required : []],
    });

    if (this.data.accion === AccionModal.Editar) {
      this.nIdUsuario = this.data.nId;
      this.fnCargarDatos();
    }
  }

  async fnCargarDatos(): Promise<void> {
    try {
      const usuarios = await this.usuariosService.fnServUsuarios<UsuarioDetalle[]>(
        '03',
        [this.nIdUsuario]
      );

      if (!usuarios.length) {
        await Swal.fire({ title: 'No se encontró el usuario', icon: 'error' });
        this.fnCerrarModal(0);
        return;
      }

      const usuario = usuarios[0];
      this.formUsuario.patchValue(usuario);
      this.dFechaNacimiento = usuario.dFechaNac;
    } catch (error) {
      console.error(error as HttpErrorResponse);
    }
  }

  async fnGrabar(): Promise<void> {
    if (this.formUsuario.invalid) {
      await Swal.fire({ title: 'Ingrese todos los campos.', icon: 'warning', timer: 1500 });
      return;
    }

    if (!this.fnValidar()) {
      return;
    }

    const opcion = this.data.accion === AccionModal.Agregar ? '04' : '05';
    const parametros: ParametroApi[] = [
      this.formUsuario.get('sNombres').value,
      this.formUsuario.get('sApellidos').value,
      this.formUsuario.get('nTipoDoc').value,
      this.formUsuario.get('sNumDoc').value,
      this.formUsuario.get('sSexo').value,
      this.formUsuario.get('nIdRol').value,
      this.formUsuario.get('sDireccion').value,
      this.formUsuario.get('nTelefono').value,
      this.dFechaNacimiento,
      this.formUsuario.get('sContrasenia').value
    ];

    if (opcion === '05') {
      parametros.push(this.nIdUsuario);
    }

    try {
      const respuesta = await this.usuariosService
        .fnServUsuarios<RespuestaUsuarios>(opcion, parametros);

      if (respuesta.mensaje === 'OK') {
        await Swal.fire({
          title: this.data.accion === AccionModal.Agregar
            ? 'Se registró con éxito'
            : 'Se actualizó con éxito',
          icon: 'success',
          timer: 3500
        });
        this.fnCerrarModal(1);
      } else {
        await Swal.fire({ title: 'No se pudo guardar', text: respuesta.mensaje, icon: 'error' });
      }
    } catch (error) {
      console.error(error as HttpErrorResponse);
    }
  }

  fnCambiarFecha(event: EventoFecha): void {
    this.dFechaNacimiento = this.fnFechaIso(event.value);
  }

  fnCerrarModal(result: number): void {
    this.dialogRef.close(result === 1 ? result : undefined);
  }

  fnValidar(): boolean {
    return this.fnValidarDocumento() && this.fnValidarTelefono();
  }

  fnValidarDocumento(): boolean {
    const documento = Number(this.formUsuario.controls.sNumDoc.value);
    const valido = documento >= 10000000 && documento <= 99999999;

    if (!valido) {
      Swal.fire({ title: 'El campo N° Documento debe tener 8 dígitos.', icon: 'warning', timer: 1500 });
    }

    return valido;
  }

  fnValidarTelefono(): boolean {
    const telefono = Number(this.formUsuario.controls.nTelefono.value);
    const valido = telefono >= 900000000 && telefono <= 999999999;

    if (!valido) {
      Swal.fire({
        title: 'El campo Teléfono debe tener 9 dígitos y empezar con 9.',
        icon: 'warning',
        timer: 1500
      });
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
