import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { LoginService } from './login.service';
import { Router } from "@angular/router";

import { HttpClient } from '@angular/common/http';

describe('LoginComponent', () => {

    let component: LoginComponent;
    let service: LoginService;
    let fixture: ComponentFixture<LoginComponent>;
    let router: Router
    let client: HttpClient

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClient
            ]
        });
        service = new LoginService(client);
        component = new LoginComponent(service, router);
    });


    it('Componente Login Creado', () => {
        expect(component).toBeTruthy();
    });

    it(`El rol no debe iniciar definido`, () => {
        let myVar: number = component.Rol;
        expect(myVar).toBeUndefined();
    })

    it(`Debe existir un metodo llamado fnLogin()`, () => {
        let nameMethod = spyOn(component, 'fnLogin')
        component.fnLogin()
        expect(nameMethod).toHaveBeenCalled();
    })



});
