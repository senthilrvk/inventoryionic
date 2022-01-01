import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StockandsalesComponent } from './stockandsales.component';

describe('StockandsalesComponent', () => {
  let component: StockandsalesComponent;
  let fixture: ComponentFixture<StockandsalesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StockandsalesComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StockandsalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
