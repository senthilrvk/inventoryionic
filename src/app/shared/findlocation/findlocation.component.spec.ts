import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FindlocationComponent } from './findlocation.component';

describe('FindlocationComponent', () => {
  let component: FindlocationComponent;
  let fixture: ComponentFixture<FindlocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FindlocationComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FindlocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
