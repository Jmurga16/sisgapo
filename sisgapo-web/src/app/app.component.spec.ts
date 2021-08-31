import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { ChangeDetectorRef } from '@angular/core';


describe('AppComponent', () => {

  let appComponent: AppComponent;
  let cdr: ChangeDetectorRef;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        AppComponent
      ],
    }).compileComponents();

    appComponent = new AppComponent(cdr)
  }));


  it('La variable active debe estar en true', () => {
    let myVar:boolean = appComponent.active;
    expect(myVar).toBeTruthy();
  })

  it('La variable bMostrar debe estar en true', () => {
    let myVar:boolean = appComponent.bMostrar;
    expect(myVar).toBeTruthy();
  })

  it(`Debe existir un metodo llamado ngOnInit()`, () => {
    let nameMethod = spyOn(appComponent, 'ngOnInit')    
    appComponent.ngOnInit()
    expect(nameMethod).toHaveBeenCalled();
})
 
  it(`Debe existir un metodo llamado fnClean()`, () => {
    let nameMethod = spyOn(appComponent, 'fnClean')
    let event
    appComponent.fnClean(event)
    expect(nameMethod).toHaveBeenCalled();
})



});
