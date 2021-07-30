import { Component, OnInit } from '@angular/core';
import { InventarioService } from '../inventario.service';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {

  url:string;

  constructor(
    private inventarioService: InventarioService
    ) { 
      this.url = 'https://localhost:44360/';
    }

  ngOnInit(): void {
   
  }

}
