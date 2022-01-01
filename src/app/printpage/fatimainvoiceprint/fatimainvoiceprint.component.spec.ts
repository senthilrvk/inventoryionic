import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FatimainvoiceprintComponent } from './fatimainvoiceprint.component';

describe('FatimainvoiceprintComponent', () => {
  let component: FatimainvoiceprintComponent;
  let fixture: ComponentFixture<FatimainvoiceprintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FatimainvoiceprintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FatimainvoiceprintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
