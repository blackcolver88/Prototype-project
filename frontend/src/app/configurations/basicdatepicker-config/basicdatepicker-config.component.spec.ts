import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicdatepickerConfigComponent } from './basicdatepicker-config.component';

describe('BasicdatepickerConfigComponent', () => {
  let component: BasicdatepickerConfigComponent;
  let fixture: ComponentFixture<BasicdatepickerConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasicdatepickerConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BasicdatepickerConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
