import { Component, OnInit } from '@angular/core';
import { InventarioService } from "./../../inventario.service";

@Component({
  selector: 'app-productos-modal',
  templateUrl: './productos-modal.component.html',
  styleUrls: ['./productos-modal.component.css']
})
export class ProductosModalComponent implements OnInit {

  url:string;


  constructor(
    private inventarioService: InventarioService,
  ) { }

  ngOnInit(): void {
    this.url = 'https://localhost:44360/';
  }

}
