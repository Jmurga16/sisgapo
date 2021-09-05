import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  url:string = environment.API_URL_INV

  constructor(private http: HttpClient) { }

  
  async LIS_Usuarios(sOpcion: string, pParametro: any) {
    const urlEndPoint = this.url + 'UsuariosService';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      sOpcion: sOpcion,
      pParametro: pParametro.join('|')
    };

    return this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

}
