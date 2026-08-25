import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})



export class AppComponent implements OnInit {
  bMostrar: boolean = true;
  title = 'SISGAPO-Front';
  active: boolean = true;
  Rol: number

  constructor(
    private cdr: ChangeDetectorRef
  ) {
    this.active = true;
  }

  ngOnInit() {
  
    this.cdr.detectChanges();

  }

  fnClean(event) {
    this.Rol = event;
  }

}
