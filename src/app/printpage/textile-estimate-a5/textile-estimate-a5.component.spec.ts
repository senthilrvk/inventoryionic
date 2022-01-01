import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextileEstimateA5Component } from './textile-estimate-a5.component';

describe('TextileEstimateA5Component', () => {
  let component: TextileEstimateA5Component;
  let fixture: ComponentFixture<TextileEstimateA5Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TextileEstimateA5Component ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextileEstimateA5Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
