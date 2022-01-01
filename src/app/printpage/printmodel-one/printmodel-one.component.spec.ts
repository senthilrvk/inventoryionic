import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintmodelOneComponent } from './printmodel-one.component';

describe('PrintmodelOneComponent', () => {
  let component: PrintmodelOneComponent;
  let fixture: ComponentFixture<PrintmodelOneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintmodelOneComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintmodelOneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
