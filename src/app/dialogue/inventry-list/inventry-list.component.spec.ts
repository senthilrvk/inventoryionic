import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InventryListComponent } from './inventry-list.component';

describe('InventryListComponent', () => {
  let component: InventryListComponent;
  let fixture: ComponentFixture<InventryListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventryListComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
