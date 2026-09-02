import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { SesionService } from './sesion.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private sesionService: SesionService,
    private router: Router
  ) { }

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    if (!this.sesionService.fnEstaAutenticado()) {
      return this.router.parseUrl('/login');
    }

    const arRoles = route.data && (route.data.roles as number[]);

    if (arRoles && arRoles.indexOf(this.sesionService.fnObtenerRol()) === -1) {
      return this.router.parseUrl('/inicio');
    }

    return true;
  }
}
