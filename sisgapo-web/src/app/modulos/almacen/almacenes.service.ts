import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AlmacenesService {

  url:string = environment.API_URL_INV
  
  constructor(private http: HttpClient) { }
  
  async fnServAlmacenes(sOpcion: string, pParametro: any) {
    const urlEndPoint = this.url + 'AlmacenesService';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      sOpcion: sOpcion,
      pParametro: pParametro.join('|')
    };

    return this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

}
