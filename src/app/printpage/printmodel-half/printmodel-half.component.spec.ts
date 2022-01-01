import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintmodelHalfComponent } from './printmodel-half.component';

describe('PrintmodelHalfComponent', () => {
  let component: PrintmodelHalfComponent;
  let fixture: ComponentFixture<PrintmodelHalfComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintmodelHalfComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintmodelHalfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
