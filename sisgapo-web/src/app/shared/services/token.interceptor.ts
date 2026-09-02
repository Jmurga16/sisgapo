import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SesionService } from './sesion.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(
    private sesionService: SesionService,
    private router: Router
  ) { }

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const sToken = this.sesionService.fnObtenerToken();

    const peticion = sToken
      ? req.clone({ setHeaders: { Authorization: `Bearer ${sToken}` } })
      : req;

    return next.handle(peticion).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          this.sesionService.fnCerrar();
          this.router.navigate(['/', 'login']);
        }

        return throwError(error);
      })
    );
  }
}
