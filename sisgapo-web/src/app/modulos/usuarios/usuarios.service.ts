import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  //url:string='https://localhost:/'
  constructor(private http: HttpClient) { }

  
  async LIS_Usuarios(sOpcion: string, pParametro: any, url: string) {
    const urlEndPoint = url + 'getAll';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      sOpcion: sOpcion,
      pParametro: pParametro.join('|')
    };

    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

}
