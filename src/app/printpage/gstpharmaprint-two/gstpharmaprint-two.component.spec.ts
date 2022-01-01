import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { GstpharmaprintTwoComponent } from './gstpharmaprint-two.component';

describe('GstpharmaprintTwoComponent', () => {
  let component: GstpharmaprintTwoComponent;
  let fixture: ComponentFixture<GstpharmaprintTwoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GstpharmaprintTwoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GstpharmaprintTwoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
