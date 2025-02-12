import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadioButtonConfigComponent } from './radio-button-config.component';

describe('RadioButtonConfigComponent', () => {
  let component: RadioButtonConfigComponent;
  let fixture: ComponentFixture<RadioButtonConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadioButtonConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadioButtonConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
