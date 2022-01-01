import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileprintmrpComponent } from './mobileprintmrp.component';

describe('MobileprintmrpComponent', () => {
  let component: MobileprintmrpComponent;
  let fixture: ComponentFixture<MobileprintmrpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MobileprintmrpComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileprintmrpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
