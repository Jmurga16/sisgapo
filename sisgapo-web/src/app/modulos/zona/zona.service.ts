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


}
