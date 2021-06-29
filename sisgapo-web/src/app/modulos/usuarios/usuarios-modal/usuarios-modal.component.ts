import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from "@angular/material/dialog";
import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
} from "@angular/forms";
import { Component, OnInit, Inject, ViewChild } from "@angular/core";
import { UsuariosService } from "./../usuarios.service";
import { UsuarioData } from './../Models/IUsuarios'

//import Swal from "sweetalert2";


@Component({
  selector: 'app-usuarios-modal',
  templateUrl: './usuarios-modal.component.html',
  styleUrls: ['./usuarios-modal.component.css']
})
export class UsuariosModalComponent implements OnInit {

  url: string;
  formUsuario:FormGroup
  sAccionModal: string;

  lDocumentos: any[] = [
    { valor: 2, nombre: 'Todos' },
    { valor: 1, nombre: 'Activo' },
    { valor: 0, nombre: 'Inactivo' },
  ];

  constructor(
    public dialogRef: MatDialogRef<UsuariosModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UsuarioData,
    private usuariosService: UsuariosService,
    private fB: FormBuilder,
  ) { }

  ngOnInit(): void {

    this.sAccionModal = this.data.accion == 0 ? "Agregar" : "Editar";

    console.log(this.data)

    
    this.formUsuario = this.fB.group({
      nIdUsuario: [0, Validators.required],
      sNombres: ["", Validators.required],
      sApellidos: ["", Validators.required],
      nTipoDoc: ["", Validators.required],
      sNumDoc: ["", Validators.required],
      sSexo: ["", Validators.required],
      nIdRol: ["", Validators.required],
      sDireccion: ["", Validators.required],
      nTelefono: ["", Validators.required],
      dFechaNacimiento: ["", Validators.required],
      sContrasenia: ["", Validators.required],
    });

  }

  fnGrabar(){

  }

  //#region Cerrar
  fnCerrarModal() {
    this.dialogRef.close();
  }
  //#endregion
}

