import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { Router } from "@angular/router";

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css'],
})

export class NavMenuComponent implements OnInit {
  mobileQuery: MediaQueryList;
  Rol: number;
  @Output() salida: EventEmitter<any> = new EventEmitter();

  isExpanded = true;
  showSubmenu: boolean = false;
  showSubSubMenu: boolean = false;
  isShowing = false;

  listaNav = [
    { id: 1, name: 'Usuarios', route: 'usuarios', icon: 'manage_accounts', subMenu: 0, mostrar: false },
    { id: 2, name: 'Almacenes', route: 'almacenes', icon: 'store', subMenu: 0, mostrar: false },
    { id: 3, name: 'Zonas', route: 'zonas', icon: 'room', subMenu: 0, mostrar: false },
    { id: 4, name: 'Inventario', route: 'zonas', icon: 'view_in_ar', subMenu: 2, mostrar: false },
  ];

  listaSubNav = [
    { idHijo: 1, idPadre: 2, name: 'SubAlmacen1', route: 'zonas', icon: 'false' },
    { idHijo: 2, idPadre: 2, name: 'SubAlmacen2', route: 'zonas', icon: 'false' },
    { idHijo: 3, idPadre: 4, name: 'Categoria', route: 'categoria', icon: 'category' },
    { idHijo: 4, idPadre: 4, name: 'Productos', route: 'productos', icon: 'inventory_2' },
  ];


  listaNavegacion = [
    { name: 'Usuarios', route: 'usuarios', icon: 'manage_accounts' },
    { name: 'Almacenes', route: 'almacenes', icon: 'store' },
    { name: 'Zonas', route: 'zonas', icon: 'room' },
  ];

  private _mobileQueryListener: () => void;

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private router: Router
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);

  }

  ngOnDestroy(): void {
    this.mobileQuery.removeEventListener('change', this._mobileQueryListener);
  }

  shouldRun = true;

  ngOnInit(): void {
    console.log('1')
    this.Rol = (parseInt(localStorage.getItem("Rol")));

    if (this.Rol<= 0) {
      this.Rol = 0
      console.log(this.Rol)      
    }

  }

  fnRuteo(ruta) {

    let sRuta = `/${ruta}`

    this.router.navigateByUrl(sRuta);

  }

  fnMostrar(index) {

    let bEstado: boolean;

    if (this.listaNav[index].mostrar) {
      bEstado = false;
    }
    else {
      bEstado = true;
    }

    this.listaNav[index].mostrar = bEstado

  }
  fnClean() {
    this.salida.emit(0);
    localStorage.clear();
    this.Rol = 0;
  }

  fnSetEvent(event) {
    this.Rol = event;
  }

}

