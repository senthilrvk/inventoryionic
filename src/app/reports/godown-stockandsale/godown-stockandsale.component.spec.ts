import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GodownStockandsaleComponent } from './godown-stockandsale.component';

describe('GodownStockandsaleComponent', () => {
  let component: GodownStockandsaleComponent;
  let fixture: ComponentFixture<GodownStockandsaleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GodownStockandsaleComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GodownStockandsaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
