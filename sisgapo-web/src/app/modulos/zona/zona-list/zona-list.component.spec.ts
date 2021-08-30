import { TestBed } from '@angular/core/testing';
import { ZonaListComponent } from './zona-list.component'
import { ZonaService } from '../zona.service';


import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';



describe('ZonaListComponent', () => {

    let component: ZonaListComponent;
    let service: ZonaService;

    let router: Router
    let client: HttpClient

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClient
            ]
        });
        service = new ZonaService(client);
        component = new ZonaListComponent(service, router);
    });


    it('Componente Creado', () => {
        expect(component).toBeTruthy();
    });

    it(`Debe existir un metodo llamado fnVerZona()`, () => {
        let nameMethod = spyOn(component, 'fnVerZona')
        let param1
        component.fnVerZona(param1)
        expect(nameMethod).toHaveBeenCalled();
    })

    it(`Debe existir un metodo llamado fnGetZonas()`, () => {
        let nameMethod = spyOn(component, 'fnGetZonas')
        component.fnGetZonas()
        expect(nameMethod).toHaveBeenCalled();
    })


});
