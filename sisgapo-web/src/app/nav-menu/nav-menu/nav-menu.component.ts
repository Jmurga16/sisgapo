import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Rol } from 'src/app/shared/models';
import { SesionService } from 'src/app/shared/services/sesion.service';

interface OpcionMenu {
  id: number;
  name: string;
  route: string;
  icon: string;
  subMenu: number;
  mostrar: boolean;
  roles: number[];
}

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css'],
})
export class NavMenuComponent implements OnInit, OnDestroy {
  mobileQuery: MediaQueryList;
  nRol: number = 0;
  sNombrePersona: string = '';

  private readonly opciones: OpcionMenu[] = [
    { id: 1, name: 'Inicio', route: 'inicio', icon: 'dashboard', subMenu: 0, mostrar: false, roles: [Rol.Administrador, Rol.Supervisor, Rol.Asistente] },
    { id: 2, name: 'Usuarios', route: 'usuarios', icon: 'manage_accounts', subMenu: 0, mostrar: false, roles: [Rol.Administrador] },
    { id: 3, name: 'Almacenes', route: 'almacenes', icon: 'store', subMenu: 0, mostrar: false, roles: [Rol.Administrador, Rol.Supervisor] },
    { id: 4, name: 'Zonas', route: 'zonas', icon: 'room', subMenu: 0, mostrar: false, roles: [Rol.Administrador, Rol.Supervisor] },
    { id: 5, name: 'Inventario', route: '', icon: 'view_in_ar', subMenu: 2, mostrar: false, roles: [Rol.Administrador, Rol.Supervisor, Rol.Asistente] },
  ];

  readonly listaSubNav = [
    { idHijo: 1, idPadre: 5, name: 'Categorías', route: 'categoria', icon: 'category' },
    { idHijo: 2, idPadre: 5, name: 'Productos', route: 'productos', icon: 'inventory_2' },
  ];

  listaNav: OpcionMenu[] = [];

  private readonly mobileQueryListener: () => void;

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private sesionService: SesionService,
    private router: Router
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this.mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addEventListener('change', this.mobileQueryListener);
  }

  ngOnInit(): void {
    this.fnCargarSesion();
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeEventListener('change', this.mobileQueryListener);
  }

  fnRuteo(ruta: string, snav?: { close: () => void }): void {
    //En móvil el menú va en modo 'over' y tapa la pantalla si no se cierra.
    if (snav && this.mobileQuery.matches) {
      snav.close();
    }

    this.router.navigateByUrl(`/${ruta}`);
  }

  fnMostrar(index: number): void {
    this.listaNav[index].mostrar = !this.listaNav[index].mostrar;
  }

  fnClean(): void {
    this.sesionService.fnCerrar();
    this.nRol = 0;
    this.sNombrePersona = '';
    this.listaNav = [];
  }

  fnSetEvent(event: number): void {
    this.fnCargarSesion();
    this.nRol = event;
  }

  private fnCargarSesion(): void {
    const oSesion = this.sesionService.fnObtener();

    this.nRol = oSesion ? oSesion.nIdRol : 0;
    this.sNombrePersona = oSesion ? oSesion.sNombrePersona : '';
    this.listaNav = this.opciones.filter(opc => opc.roles.indexOf(this.nRol) !== -1);
  }
}
