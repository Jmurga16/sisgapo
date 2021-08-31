import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {

  constructor(private http: HttpClient) { }

  //Servicio para Categoria
  async fnServCategoria(sOpcion: string, pParametro: any, url: string) {
    //EndPoint de Categoria
    const urlEndPoint = url + 'InventarioService/Categoria';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      sOpcion: sOpcion,
      pParametro: pParametro.join('|')
    };

    return this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  //Servicio para producto
  async fnServProducto(sOpcion: string, pParametro: any, url: string) {
    //EndPoint de Producto
    const urlEndPoint = url + 'InventarioService/Producto';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      sOpcion: sOpcion,
      pParametro: pParametro.join('|')
    };

    return this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

}
