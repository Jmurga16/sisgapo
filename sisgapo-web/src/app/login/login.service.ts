import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private http: HttpClient) { }

  async LoginServ(sNombreUsuario: string, sContrasenia: any, url: string) {
    const urlEndPoint = url + 'LoginService';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      sNombreUsuario: sNombreUsuario,
      sContrasenia: sContrasenia
    };

    return this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }
}
