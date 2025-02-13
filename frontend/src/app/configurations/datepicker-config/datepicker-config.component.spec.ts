import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatepickerConfigComponent } from './datepicker-config.component';

describe('DatepickerConfigComponent', () => {
  let component: DatepickerConfigComponent;
  let fixture: ComponentFixture<DatepickerConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatepickerConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatepickerConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
