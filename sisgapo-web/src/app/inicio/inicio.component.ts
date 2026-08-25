import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html'
})
export class InicioComponent implements OnInit {

  url:string;


  constructor() {
    this.url='';
   }

  ngOnInit(): void {
    this.url = 'https://localhost:44360/';
  }

}
