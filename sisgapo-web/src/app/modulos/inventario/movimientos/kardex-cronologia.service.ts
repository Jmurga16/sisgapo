import { Injectable } from '@angular/core';
import { MovimientoListado } from 'src/app/shared/models';

export interface MovimientoKardex extends MovimientoListado {
  sHora: string;
}

export interface DiaKardex {
  sFecha: string;
  sEtiqueta: string;
  nEntradas: number;
  nSalidas: number;
  lMovimientos: MovimientoKardex[];
}

const DIAS_SEMANA = [
  'domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'
];

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'
];

//Agrupa el kardex por día para la vista de cronología. Es cálculo de presentación
//sin estado: vive aquí y no en el componente, que ya carga tabla, filtros y resumen.
@Injectable({ providedIn: 'root' })
export class KardexCronologiaService {

  fnAgruparPorDia(lMovimientos: MovimientoListado[]): DiaKardex[] {
    const oDias: { [sFecha: string]: DiaKardex } = {};
    const lFechas: string[] = [];

    lMovimientos.forEach(mov => {
      const sFecha = (mov.dFechaMov || '').substring(0, 10);

      if (!oDias[sFecha]) {
        oDias[sFecha] = {
          sFecha,
          sEtiqueta: this.fnEtiquetaFecha(sFecha),
          nEntradas: 0,
          nSalidas: 0,
          lMovimientos: []
        };
        lFechas.push(sFecha);
      }

      oDias[sFecha].nEntradas += mov.nEntrada;
      oDias[sFecha].nSalidas += mov.nSalida;
      oDias[sFecha].lMovimientos.push({ ...mov, sHora: (mov.dFechaMov || '').substring(11, 16) });
    });

    //Descendente: el movimiento más reciente arriba, como en la tabla.
    return lFechas.sort().reverse().map(sFecha => oDias[sFecha]);
  }

  private fnEtiquetaFecha(sFecha: string): string {
    const partes = sFecha.split('-');

    if (partes.length < 3) {
      return sFecha;
    }

    const fecha = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
    const sEtiqueta = `${DIAS_SEMANA[fecha.getDay()]} ${fecha.getDate()} de ${MESES[fecha.getMonth()]} de ${fecha.getFullYear()}`;

    const hoy = new Date();
    const sHoy = this.fnFechaIso(hoy);
    const sAyer = this.fnFechaIso(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 1));

    if (sFecha === sHoy) {
      return `Hoy · ${sEtiqueta}`;
    }

    if (sFecha === sAyer) {
      return `Ayer · ${sEtiqueta}`;
    }

    return sEtiqueta;
  }

  private fnFechaIso(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }
}
