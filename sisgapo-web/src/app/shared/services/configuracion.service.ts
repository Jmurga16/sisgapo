import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfiguracionAplicacion } from 'src/app/shared/models';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionService {
  bDemoSoloLectura: boolean = false;
  private bCargada: boolean = false;

  constructor(private http: HttpClient) { }

  async fnCargar(): Promise<void> {
    if (this.bCargada) {
      return;
    }

    try {
      const configuracion = await this.http
        .get<ConfiguracionAplicacion>(environment.API_URL_INV + 'ConfiguracionService')
        .toPromise();
      this.bDemoSoloLectura = Boolean(configuracion && configuracion.demoSoloLectura);
      this.bCargada = true;
    } catch {
      this.bDemoSoloLectura = false;
    }
  }
}
