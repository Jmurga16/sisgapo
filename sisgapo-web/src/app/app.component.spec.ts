import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AppComponent } from './app.component';

describe('AppComponent', () => {

  let eventos: Subject<any>;
  let titulo: Title;
  let ruta: any;

  const fnCrear = () => {
    eventos = new Subject<any>();
    titulo = { setTitle: jasmine.createSpy('setTitle') } as any;
    ruta = { firstChild: null, snapshot: { data: {} } };
    const componente = new AppComponent({ events: eventos } as any as Router, ruta as ActivatedRoute, titulo);
    componente.ngOnInit();
    return componente;
  };

  it('usa el nombre completo del sistema cuando la ruta no declara sección', () => {
    fnCrear();
    eventos.next(new NavigationEnd(1, '/login', '/login'));
    expect(titulo.setTitle).toHaveBeenCalledWith('SISGAPO — Sistema de Gestión de Almacén de Productos Orgánicos');
  });

  it('antepone SISGAPO a la sección de la ruta más profunda', () => {
    fnCrear();
    ruta.firstChild = { firstChild: null, snapshot: { data: { titulo: 'Productos' } } };
    eventos.next(new NavigationEnd(2, '/productos', '/productos'));
    expect(titulo.setTitle).toHaveBeenCalledWith('SISGAPO | Productos');
  });
});
