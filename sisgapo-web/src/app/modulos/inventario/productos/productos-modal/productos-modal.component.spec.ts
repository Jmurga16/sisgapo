import { TestBed } from '@angular/core/testing';
import { ProductosModalComponent } from './productos-modal.component';
import { InventarioService } from './../../inventario.service';

import { HttpClient } from '@angular/common/http';

import { FormBuilder, } from "@angular/forms";
import { MatDialogRef, } from "@angular/material/dialog";
import { ProductoData } from './../productos.component'


describe('ProductosModalComponent', () => {

    let component: ProductosModalComponent;
    let service: InventarioService;
    
    let client: HttpClient;

    let dialogRef: MatDialogRef<ProductosModalComponent>;
    let data: ProductoData;    
    let fB: FormBuilder;


    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClient
            ]
        });
        service = new InventarioService(client);
        component = new ProductosModalComponent(dialogRef,data,service, fB);
    });


    it('Componente ProductosModal Creado', () => {
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

    it(`Debe existir un metodo llamado fnCargarDatos()`, () => {
        let nameMethod = spyOn(component, 'fnCargarDatos')
        component.fnCargarDatos()
        expect(nameMethod).toHaveBeenCalled();
    })

    it(`Debe existir un metodo llamado fnListarAlmacenes()`, () => {
        let nameMethod = spyOn(component, 'fnListarAlmacenes')
        component.fnListarAlmacenes()
        expect(nameMethod).toHaveBeenCalled();
    })

    it(`Debe existir un metodo llamado fnListarCategorias()`, () => {
        let nameMethod = spyOn(component, 'fnListarCategorias')
        component.fnListarCategorias()
        expect(nameMethod).toHaveBeenCalled();
    })

    it(`Debe existir un metodo llamado fnListarUnidadMedida()`, () => {
        let nameMethod = spyOn(component, 'fnListarUnidadMedida')
        component.fnListarUnidadMedida()
        expect(nameMethod).toHaveBeenCalled();
    })

    it(`Debe existir un metodo llamado fnGrabar()`, () => {
        let nameMethod = spyOn(component, 'fnGrabar')
        component.fnGrabar()
        expect(nameMethod).toHaveBeenCalled();
    })

    it(`Debe existir un metodo llamado fnCambiarFecha()`, () => {
        let nameMethod = spyOn(component, 'fnCambiarFecha')
        let param1,param2
        component.fnCambiarFecha(param1,param2)
        expect(nameMethod).toHaveBeenCalled();
    })

    it(`Debe existir un metodo llamado fnConvertirFecha()`, () => {
        let nameMethod = spyOn(component, 'fnConvertirFecha')
        let param1,param2
        component.fnConvertirFecha(param1,param2)
        expect(nameMethod).toHaveBeenCalled();
    })

});
