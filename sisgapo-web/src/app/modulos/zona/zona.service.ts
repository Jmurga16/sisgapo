import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ZonaData } from './Models/IZona';
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ZonaService {

  url: string = environment.API_URL_INV

  API_URI: string

  constructor(private http: HttpClient) {
    this.API_URI = this.url + 'api'
  }

  getZonas() {
    return this.http.get(`${this.API_URI}/zona`)
  }

  getOne(id: string) {
    return this.http.get(`${this.API_URI}/zona/editar/${id}`);
  }

  saveZona(zona: ZonaData) {
    return this.http.post(`${this.API_URI}/zona`, zona);
  }

  //Actualizar. No existía: el formulario de edición llamaba a saveZona() y
  //cada guardado creaba una zona nueva. Ver 06-hallazgos.md §C-03.
  updateZona(zona: ZonaData) {
    return this.http.put(`${this.API_URI}/zona`, zona);
  }

  //Activar / dar de baja (baja lógica).
  cambiarEstado(nIdZona: number, bEstado: boolean) {
    return this.http.put(`${this.API_URI}/zona/estado/${nIdZona}/${bEstado}`, {});
  }

}
