import { TestBed } from '@angular/core/testing';
import { UsuariosListComponent } from './usuarios-list.component'
import { UsuariosService } from '../usuarios.service';


import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';



describe('UsuariosListComponent', () => {

    let component: UsuariosListComponent;
    let service: UsuariosService;
    
    let dialog: MatDialog
    let client: HttpClient

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClient
            ]
        });
        service = new UsuariosService(client);
        component = new UsuariosListComponent(service, dialog);
    });


    it('Componente UsuariosList Creado', () => {
        expect(component).toBeTruthy();
    });

    it(`Debe existir un metodo llamado fnListarUsuarios()`, () => {
        let nameMethod = spyOn(component, 'fnListarUsuarios')
        component.fnListarUsuarios()
        expect(nameMethod).toHaveBeenCalled();
    })

    it(`Debe existir un metodo llamado fnAbrirModal()`, () => {
        let nameMethod = spyOn(component, 'fnAbrirModal')
        let param1,param2
        component.fnAbrirModal(param1,param2)
        expect(nameMethod).toHaveBeenCalled();
    })

    it(`Debe existir un metodo llamado fnFiltrarUsuarios()`, () => {
        let nameMethod = spyOn(component, 'fnFiltrarUsuarios')
        component.fnFiltrarUsuarios()
        expect(nameMethod).toHaveBeenCalled();
    })

    it(`Debe existir un metodo llamado fnCambiarEstado()`, () => {
        let nameMethod = spyOn(component, 'fnCambiarEstado')
        let param1,param2
        component.fnCambiarEstado(param1,param2)
        expect(nameMethod).toHaveBeenCalled();
    })



});
