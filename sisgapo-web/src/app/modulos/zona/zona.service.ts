import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RespuestaApi, ZonaGuardar, ZonaListado } from 'src/app/shared/models';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ZonaService {
  private readonly sUrlApi: string = environment.API_URL_INV + 'api';

  constructor(private http: HttpClient) { }

  getZonas(): Observable<ZonaListado[]> {
    return this.http.get<ZonaListado[]>(`${this.sUrlApi}/zona`);
  }

  getOne(nIdZona: number | string): Observable<ZonaListado[]> {
    return this.http.get<ZonaListado[]>(`${this.sUrlApi}/zona/editar/${nIdZona}`);
  }

  saveZona(zona: ZonaGuardar): Observable<RespuestaApi> {
    return this.http.post<RespuestaApi>(`${this.sUrlApi}/zona`, zona);
  }

  updateZona(zona: ZonaGuardar): Observable<RespuestaApi> {
    return this.http.put<RespuestaApi>(`${this.sUrlApi}/zona`, zona);
  }

  cambiarEstado(nIdZona: number, bEstado: boolean): Observable<RespuestaApi> {
    return this.http.put<RespuestaApi>(`${this.sUrlApi}/zona/estado/${nIdZona}/${bEstado}`, {});
  }

  static fnMensajeError(error: HttpErrorResponse, mensajePorDefecto: string): string {
    const respuesta = error && error.error as RespuestaApi;
    return respuesta && respuesta.mensaje ? respuesta.mensaje : mensajePorDefecto;
  }
}
