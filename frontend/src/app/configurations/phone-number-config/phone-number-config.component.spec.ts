import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhoneNumberConfigComponent } from './phone-number-config.component';

describe('PhoneNumberConfigComponent', () => {
  let component: PhoneNumberConfigComponent;
  let fixture: ComponentFixture<PhoneNumberConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhoneNumberConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhoneNumberConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
