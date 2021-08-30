import { TestBed } from '@angular/core/testing';
import { ProductosComponent } from './productos.component'
import { InventarioService } from '../inventario.service';


import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';



describe('ProductosComponent', () => {

    let component: ProductosComponent;
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
        component = new ProductosComponent(service, dialog);
    });


    it('Componente Productos Creado', () => {
        expect(component).toBeTruthy();
    });

    it(`Debe existir un metodo llamado fnFiltrarTabla()`, () => {
        let nameMethod = spyOn(component, 'fnFiltrarTabla')
        let param1
        component.fnFiltrarTabla(param1)
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

    it(`Debe existir un metodo llamado fnListarProductos()`, () => {
        let nameMethod = spyOn(component, 'fnListarProductos')
        component.fnListarProductos()
        expect(nameMethod).toHaveBeenCalled();
    })

    it(`Debe existir un metodo llamado fnCleanFilter()`, () => {
        let nameMethod = spyOn(component, 'fnCleanFilter')
        component.fnCleanFilter()
        expect(nameMethod).toHaveBeenCalled();
    })

    it(`Debe existir un metodo llamado fnCambiarEstado()`, () => {
        let nameMethod = spyOn(component, 'fnCambiarEstado')
        let param1, param2
        component.fnCambiarEstado(param1, param2)
        expect(nameMethod).toHaveBeenCalled();
    })



});
