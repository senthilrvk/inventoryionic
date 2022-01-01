import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ArabicThermalPrintPage } from './arabic-thermal-print.page';

describe('ArabicThermalPrintPage', () => {
  let component: ArabicThermalPrintPage;
  let fixture: ComponentFixture<ArabicThermalPrintPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ArabicThermalPrintPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ArabicThermalPrintPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
