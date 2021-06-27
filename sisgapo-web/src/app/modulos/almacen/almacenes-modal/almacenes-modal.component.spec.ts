import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlmacenesModalComponent } from './almacenes-modal.component';

describe('AlmacenesModalComponent', () => {
  let component: AlmacenesModalComponent;
  let fixture: ComponentFixture<AlmacenesModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlmacenesModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlmacenesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
