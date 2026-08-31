import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css'],
})
export class NavMenuComponent implements OnInit, OnDestroy {
  mobileQuery: MediaQueryList;
  Rol: number = 0;
  readonly listaNav = [
    { id: 1, name: 'Inicio', route: 'inicio', icon: 'dashboard', subMenu: 0, mostrar: false },
    { id: 2, name: 'Usuarios', route: 'usuarios', icon: 'manage_accounts', subMenu: 0, mostrar: false },
    { id: 3, name: 'Almacenes', route: 'almacenes', icon: 'store', subMenu: 0, mostrar: false },
    { id: 4, name: 'Zonas', route: 'zonas', icon: 'room', subMenu: 0, mostrar: false },
    { id: 5, name: 'Inventario', route: '', icon: 'view_in_ar', subMenu: 2, mostrar: false },
  ];
  readonly listaSubNav = [
    { idHijo: 1, idPadre: 5, name: 'Categorías', route: 'categoria', icon: 'category' },
    { idHijo: 2, idPadre: 5, name: 'Productos', route: 'productos', icon: 'inventory_2' },
  ];

  private readonly mobileQueryListener: () => void;

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private router: Router
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this.mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addEventListener('change', this.mobileQueryListener);
  }

  ngOnInit(): void {
    this.Rol = Number(localStorage.getItem('Rol')) || 0;
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeEventListener('change', this.mobileQueryListener);
  }

  fnRuteo(ruta: string): void {
    this.router.navigateByUrl(`/${ruta}`);
  }

  fnMostrar(index: number): void {
    this.listaNav[index].mostrar = !this.listaNav[index].mostrar;
  }

  fnClean(): void {
    localStorage.clear();
    this.Rol = 0;
  }

  fnSetEvent(event: number): void {
    this.Rol = event;
  }
}
