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

 /*  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'SISGAPO-Front'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('SISGAPO-Front');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.content span').textContent).toContain('SISGAPO-Front app is running!');
  }); */

  it('La variable active debe estar en true', () => {
    let myVar:boolean = appComponent.active;
    expect(myVar).toBeTruthy();
  })

  it('La variable bMostrar debe estar en true', () => {
    let myVar:boolean = appComponent.bMostrar;
    expect(myVar).toBeTruthy();
  })

});
