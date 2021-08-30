import { TestBed } from '@angular/core/testing';
import { CategoriaComponent } from './categoria.component'
import { InventarioService } from '../inventario.service';


import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';



describe('CategoriaComponent', () => {

    let component: CategoriaComponent;
    let service: InventarioService;
    
    let dialog: MatDialog
    let client: HttpClient

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClient
            ]
        });
        service = new InventarioService(client);
        component = new CategoriaComponent(service, dialog);
    });


    it('Componente Categoria Creado', () => {
        expect(component).toBeTruthy();
    });

    it(`Debe existir un metodo llamado fnFiltrarTabla()`, () => {
        let nameMethod = spyOn(component, 'fnFiltrarTabla')
        let event
        component.fnFiltrarTabla(event)
        expect(nameMethod).toHaveBeenCalled();
    })

    it(`Debe existir un metodo llamado fnListarCategorias()`, () => {
        let nameMethod = spyOn(component, 'fnListarCategorias')        
        component.fnListarCategorias()
        expect(nameMethod).toHaveBeenCalled();
    })

    it(`Debe existir un metodo llamado fnCambiarEstado()`, () => {
        let nameMethod = spyOn(component, 'fnCambiarEstado')
        let param1,param2
        component.fnCambiarEstado(param1,param2)
        expect(nameMethod).toHaveBeenCalled();
    })

    it(`Debe existir un metodo llamado fnAbrirModal()`, () => {
        let nameMethod = spyOn(component, 'fnAbrirModal')
        let param1,param2
        component.fnAbrirModal(param1,param2)
        expect(nameMethod).toHaveBeenCalled();
    })


});
