import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientesModalComponent } from './clientes-modal.component';

describe('ClientesModalComponent', () => {
  let component: ClientesModalComponent;
  let fixture: ComponentFixture<ClientesModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientesModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
