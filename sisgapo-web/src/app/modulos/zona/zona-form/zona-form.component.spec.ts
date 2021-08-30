import { TestBed } from '@angular/core/testing';
import { ZonaFormComponent } from './zona-form.component'
import { ZonaService } from '../zona.service';


import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';



describe('ZonaFormComponent', () => {

    let component: ZonaFormComponent;
    let service: ZonaService;

    let router: Router
    let activatedRoute: ActivatedRoute
    let client: HttpClient

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClient
            ]
        });
        service = new ZonaService(client);
        component = new ZonaFormComponent(service, router, activatedRoute);
    });


    it('Componente Creado', () => {
        expect(component).toBeTruthy();
    });


    it(`Debe existir un metodo llamado fnSaveNewZona()`, () => {
        let nameMethod = spyOn(component, 'fnSaveNewZona')
        component.fnSaveNewZona()
        expect(nameMethod).toHaveBeenCalled();
    })

    it(`Debe existir un metodo llamado changeImagen()`, () => {
        let nameMethod = spyOn(component, 'changeImagen')
        component.changeImagen()
        expect(nameMethod).toHaveBeenCalled();
    })

    it(`Debe existir un metodo llamado fnValidarImagen()`, () => {
        let nameMethod = spyOn(component, 'fnValidarImagen')
        component.fnValidarImagen()
        expect(nameMethod).toHaveBeenCalled();
    })

});
