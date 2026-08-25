import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: 'root'
})
export class PanelService {

  url: string = environment.API_URL_INV

  constructor(private http: HttpClient) { }

  //Servicio del panel de inicio.
  //  01 tarjetas · 02 por almacén · 03 por categoría · 04 próximos a vencer
  async fnServPanel(sOpcion: string, pParametro: any) {
    const urlEndPoint = this.url + 'Panel';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      sOpcion: sOpcion,
      pParametro: pParametro.join('|')
    };

    return this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

}
