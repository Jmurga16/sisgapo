import { TestBed } from '@angular/core/testing';
import { AlmacenesModalComponent } from './almacenes-modal.component';
import { AlmacenesService } from './../almacenes.service';
import { FormBuilder, } from "@angular/forms";
import { HttpClient } from '@angular/common/http';

import { MatDialogRef, } from "@angular/material/dialog";

import { AlmacenData } from './../Models/IAlmacen'


describe('AlmacenesModalComponent', () => {

    let component: AlmacenesModalComponent;
    let service: AlmacenesService;
    
    let client: HttpClient;

    let dialogRef: MatDialogRef<AlmacenesModalComponent>;
    let data: AlmacenData;    
    let fB: FormBuilder;


    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClient
            ]
        });
        service = new AlmacenesService(client);
        component = new AlmacenesModalComponent(dialogRef,data,service, fB);
    });


    it('Componente AlmacenesModal Creado', () => {
        expect(component).toBeTruthy();
    });

    it(`La variable 'accion' inicia sin definirse`, () => {        
        let myVar: string = component.sAccionModal;        
        expect(myVar).toBeUndefined();
    })

    it(`Debe existir un metodo llamado fnCerrarModal()`, () => {
        let nameMethod = spyOn(component, 'fnCerrarModal')
        let param1
        component.fnCerrarModal(param1)
        expect(nameMethod).toHaveBeenCalled();
    })

    it(`Debe existir un metodo llamado fnListarZonas()`, () => {
        let nameMethod = spyOn(component, 'fnListarZonas')        
        component.fnListarZonas()
        expect(nameMethod).toHaveBeenCalled();
    })

    it(`Debe existir un metodo llamado fnListarSupervisor()`, () => {
        let nameMethod = spyOn(component, 'fnListarSupervisor')        
        component.fnListarSupervisor()
        expect(nameMethod).toHaveBeenCalled();
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



});
