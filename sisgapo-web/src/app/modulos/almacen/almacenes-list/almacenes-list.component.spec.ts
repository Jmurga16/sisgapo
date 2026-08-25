import { TestBed } from '@angular/core/testing';
import { AlmacenesListComponent } from './almacenes-list.component';
import { AlmacenesService } from './../almacenes.service';

import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';

describe('AlmacenesListComponent', () => {

    let component: AlmacenesListComponent;
    let service: AlmacenesService;
    let dialog: MatDialog
    let client: HttpClient


    beforeEach(() => {
        // 0. set up the test environment
        TestBed.configureTestingModule({
            imports: [
                HttpClient
            ]
        });
        service = new AlmacenesService(client);
        component = new AlmacenesListComponent(service, dialog);
    });


    it('Componente AlmacenesList Creado', () => {
        expect(component).toBeTruthy();
    });

    it(`El componente se llama 'Almacenes'`, () => {
        let myVar: string = component.appName;
        expect(myVar).toEqual('Almacenes');
    })

    it(`Debe existir un metodo llamado applyFilter()`, () => {
        let nameMethod = spyOn(component, 'applyFilter')
        let event
        component.applyFilter(event)
        expect(nameMethod).toHaveBeenCalled();
    })

    it(`Debe existir un metodo llamado fnAbrirModal()`, () => {
        let nameMethod = spyOn(component, 'fnAbrirModal')
        let accion, nIdAlmacen;
        component.fnAbrirModal(accion, nIdAlmacen)
        expect(nameMethod).toHaveBeenCalled();
    })

    it(`Debe existir un metodo llamado fnListarAlmacenes()`, () => {
        let nameMethod = spyOn(component, 'fnListarAlmacenes')
        component.fnListarAlmacenes()
        expect(nameMethod).toHaveBeenCalled();
    })

    it(`Debe existir un metodo llamado fnCambiarEstado()`, () => {
        let nameMethod = spyOn(component, 'fnCambiarEstado')
        let param1, param2;
        component.fnCambiarEstado(param1, param2)
        expect(nameMethod).toHaveBeenCalled();
    })


});
