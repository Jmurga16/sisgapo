import { TestBed } from '@angular/core/testing';
import { CategoriaModalComponent } from './categoria-modal.component';
import { InventarioService } from './../../inventario.service';

import { HttpClient } from '@angular/common/http';

import { FormBuilder, } from "@angular/forms";
import { MatDialogRef, } from "@angular/material/dialog";
import { DatosModal } from 'src/app/shared/models';


describe('CategoriaModalComponent', () => {

    let component: CategoriaModalComponent;
    let service: InventarioService;

    let client: HttpClient;

    let dialogRef: MatDialogRef<CategoriaModalComponent>;
    let data: DatosModal;
    let fB: FormBuilder;


    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClient
            ]
        });
        service = new InventarioService(client);
        component = new CategoriaModalComponent(dialogRef, data, service, fB);
    });


    it('Componente CategoriaModal Creado', () => {
        expect(component).toBeTruthy();
    });

    it(`La variable 'accion' inicia sin definirse`, () => {
        let myVar: string = component.sAccionModal;
        expect(myVar).toBeUndefined();
    })

    it(`Debe existir un metodo llamado fnGrabar()`, () => {
        let nameMethod = spyOn(component, 'fnGrabar')
        component.fnGrabar()
        expect(nameMethod).toHaveBeenCalled();
    })

    it(`Debe existir un metodo llamado fnCargarDatos()`, () => {
        let nameMethod = spyOn(component, 'fnCargarDatos')
        component.fnCargarDatos()
        expect(nameMethod).toHaveBeenCalled();
    })

    it(`Debe existir un metodo llamado fnCerrarModal()`, () => {
        let nameMethod = spyOn(component, 'fnCerrarModal')
        let param1
        component.fnCerrarModal(param1)
        expect(nameMethod).toHaveBeenCalled();
    })


});
