import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PrintmodelcreditnoteComponent } from './printmodelcreditnote.component';

describe('PrintmodelcreditnoteComponent', () => {
  let component: PrintmodelcreditnoteComponent;
  let fixture: ComponentFixture<PrintmodelcreditnoteComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintmodelcreditnoteComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PrintmodelcreditnoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
