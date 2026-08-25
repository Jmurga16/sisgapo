import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  
  url:string = environment.API_URL_INV

  constructor(private http: HttpClient) { }

  //Servicio para Categoria
  async fnServCategoria(sOpcion: string, pParametro: any) {
    //EndPoint de Categoria
    const urlEndPoint = this.url + 'InventarioService/Categoria';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      sOpcion: sOpcion,
      pParametro: pParametro.join('|')
    };

    return this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  //Servicio para producto
  async fnServProducto(sOpcion: string, pParametro: any) {
    //EndPoint de Producto
    const urlEndPoint = this.url + 'InventarioService/Producto';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      sOpcion: sOpcion,
      pParametro: pParametro.join('|')
    };

    return this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

}
