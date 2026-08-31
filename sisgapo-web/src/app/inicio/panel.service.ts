import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ParametroApi } from 'src/app/shared/models';
@Injectable({
  providedIn: 'root'
})
export class PanelService {

  private readonly url: string = environment.API_URL_INV;

  constructor(private http: HttpClient) { }

  async fnServPanel<TFila>(sOpcion: string, pParametro: ParametroApi[]): Promise<TFila[]> {
    const urlEndPoint: string = this.url + 'Panel';
    const httpHeaders: HttpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      sOpcion,
      pParametro: pParametro.join('|')
    };

    return this.http.post<TFila[]>(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

}
