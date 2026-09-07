import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-estado-carga',
  templateUrl: './estado-carga.component.html',
  styleUrls: ['./estado-carga.component.css']
})
export class EstadoCargaComponent {
  @Input() bCargando: boolean = false;
  @Input() sError: string = '';
  @Input() sTextoCarga: string = 'Cargando…';

  @Output() reintentar = new EventEmitter<void>();
}
