import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InventryPosPage } from './inventry-pos.page';

describe('InventryPosPage', () => {
  let component: InventryPosPage;
  let fixture: ComponentFixture<InventryPosPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventryPosPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventryPosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
