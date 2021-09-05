import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  url:string = environment.API_URL_INV

  constructor(private http: HttpClient) { }

  async LoginServ(sNombreUsuario: string, sContrasenia: any) {
    const urlEndPoint = this.url + 'LoginService';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      sNombreUsuario: sNombreUsuario,
      sContrasenia: sContrasenia
    };

    return this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }
}
