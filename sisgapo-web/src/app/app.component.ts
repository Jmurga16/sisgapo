import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';

const TITULO_BASE = 'SISGAPO — Sistema de Gestión de Almacén de Productos Orgánicos';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private titulo: Title
  ) { }

  ngOnInit(): void {
    this.router.events.pipe(
      filter(evento => evento instanceof NavigationEnd),
      map(() => this.fnRutaActiva().snapshot.data.titulo)
    ).subscribe(sSeccion => {
      this.titulo.setTitle(sSeccion ? `SISGAPO | ${sSeccion}` : TITULO_BASE);
    });
  }

  private fnRutaActiva(): ActivatedRoute {
    let ruta = this.route;
    while (ruta.firstChild) {
      ruta = ruta.firstChild;
    }
    return ruta;
  }
}
