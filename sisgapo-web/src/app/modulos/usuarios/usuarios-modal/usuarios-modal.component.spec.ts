import { TestBed } from '@angular/core/testing';
import { UsuariosModalComponent } from './usuarios-modal.component';
import { UsuariosService } from '../usuarios.service';

import { HttpClient } from '@angular/common/http';

import { FormBuilder, } from "@angular/forms";
import { MatDialogRef, } from "@angular/material/dialog";
import { UsuarioData } from './../Models/IUsuarios'


describe('UsuariosModalComponent', () => {

    let component: UsuariosModalComponent;
    let service: UsuariosService;
    
    let client: HttpClient;

    let dialogRef: MatDialogRef<UsuariosModalComponent>;
    let data: UsuarioData;    
    let fB: FormBuilder;


    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClient
            ]
        });
        service = new UsuariosService(client);
        component = new UsuariosModalComponent(dialogRef,data,service, fB);
    });


    it('Componente Creado', () => {
        expect(component).toBeTruthy();
    });

    it(`La variable 'accion' inicia sin definirse`, () => {
        let myVar: string = component.sAccionModal;
        expect(myVar).toBeUndefined();
    })

    it(`Debe existir un metodo llamado fnCargarDatos()`, () => {
        let nameMethod = spyOn(component, 'fnCargarDatos')
        component.fnCargarDatos()
        expect(nameMethod).toHaveBeenCalled();
    })
    

    it(`Debe existir un metodo llamado fnGrabar()`, () => {
        let nameMethod = spyOn(component, 'fnGrabar')
        component.fnGrabar()
        expect(nameMethod).toHaveBeenCalled();
    })

    it(`Debe existir un metodo llamado fnCambiarFecha()`, () => {
        let nameMethod = spyOn(component, 'fnCambiarFecha')
        let param1
        component.fnCambiarFecha(param1)
        expect(nameMethod).toHaveBeenCalled();
    })

    it(`Debe existir un metodo llamado fnConvertirFecha()`, () => {
        let nameMethod = spyOn(component, 'fnConvertirFecha')
        let param1,param2
        component.fnConvertirFecha(param1,param2)
        expect(nameMethod).toHaveBeenCalled();
    })


    it(`Debe existir un metodo llamado fnCerrarModal()`, () => {
        let nameMethod = spyOn(component, 'fnCerrarModal')
        let param1
        component.fnCerrarModal(param1)
        expect(nameMethod).toHaveBeenCalled();
    })

    it(`Debe existir un metodo llamado fnValidar()`, () => {
        let nameMethod = spyOn(component, 'fnValidar')
        component.fnValidar()
        expect(nameMethod).toHaveBeenCalled();
    })

    it(`Debe existir un metodo llamado fnValidarDocumento()`, () => {
        let nameMethod = spyOn(component, 'fnValidarDocumento')
        component.fnValidarDocumento()
        expect(nameMethod).toHaveBeenCalled();
    })

    it(`Debe existir un metodo llamado fnValidarTelefono()`, () => {
        let nameMethod = spyOn(component, 'fnValidarTelefono')
        component.fnValidarTelefono()
        expect(nameMethod).toHaveBeenCalled();
    })

});
