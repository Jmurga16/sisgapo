import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})



export class AppComponent implements OnInit {
  bMostrar: boolean;
  title = 'SISGAPO-Front';
  Rol: number

  constructor(
    private cdr: ChangeDetectorRef
  ) {

  }

  ngOnInit() {
    this.Rol = (parseInt(localStorage.getItem("Rol")));

    this.cdr.detectChanges();

  }

  fnClean(event) {
    this.Rol = event;
  }

}
