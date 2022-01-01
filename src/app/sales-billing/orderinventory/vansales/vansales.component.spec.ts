import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VansalesComponent } from './vansales.component';

describe('VansalesComponent', () => {
  let component: VansalesComponent;
  let fixture: ComponentFixture<VansalesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VansalesComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VansalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
