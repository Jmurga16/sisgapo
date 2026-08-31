import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginResultado } from 'src/app/shared/models';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private readonly url: string = environment.API_URL_INV;

  constructor(private http: HttpClient) { }

  async fnServLogin(sNombreUsuario: string, sContrasenia: string): Promise<LoginResultado[]> {
    const urlEndPoint = this.url + 'LoginService';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = { sNombreUsuario, sContrasenia };

    return this.http.post<LoginResultado[]>(
      urlEndPoint,
      JSON.stringify(params),
      { headers: httpHeaders }
    ).toPromise();
  }
}
