import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from "src/environments/environment";
import { ParametroApi } from 'src/app/shared/models';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  private readonly url: string = environment.API_URL_INV;

  constructor(private http: HttpClient) { }

  async fnServUsuarios<T>(sOpcion: string, pParametro: ParametroApi[]): Promise<T> {
    const urlEndPoint = this.url + 'UsuariosService';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      sOpcion,
      parametros: pParametro.map(String)
    };

    return this.http.post<T>(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

}
