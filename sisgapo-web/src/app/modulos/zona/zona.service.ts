import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {ZonaData} from './Models/IZona';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ZonaService {

  API_URI='https://localhost:44360/api'

  constructor( private http:HttpClient) { }

  getZonas(){
    return this.http.get(`${this.API_URI}/zona`)
  }

  getOne(id:string){
    return this.http.get(`${this.API_URI}/zona/editar/${id}`);
  }

  saveZona(zona: ZonaData){
    return this.http.post(`${this.API_URI}/zona`,zona);
  }


}
