import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from "src/environments/environment";
import { ParametroApi } from 'src/app/shared/models';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  
  private readonly url: string = environment.API_URL_INV;

  constructor(private http: HttpClient) { }

  async fnServCategoria<T>(sOpcion: string, pParametro: ParametroApi[]): Promise<T> {
    const urlEndPoint = this.url + 'InventarioService/Categoria';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      sOpcion,
      parametros: pParametro.map(String)
    };

    return this.http.post<T>(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  async fnServProducto<T>(sOpcion: string, pParametro: ParametroApi[]): Promise<T> {
    const urlEndPoint = this.url + 'InventarioService/Producto';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      sOpcion,
      parametros: pParametro.map(String)
    };

    return this.http.post<T>(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  async fnServLote<T>(sOpcion: string, pParametro: ParametroApi[]): Promise<T> {
    const urlEndPoint = this.url + 'InventarioService/Lote';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      sOpcion,
      parametros: pParametro.map(String)
    };

    return this.http.post<T>(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  async fnServMovimiento<T>(sOpcion: string, pParametro: ParametroApi[]): Promise<T> {
    const urlEndPoint = this.url + 'InventarioService/Movimiento';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      sOpcion,
      parametros: pParametro.map(String)
    };

    return this.http.post<T>(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

}
