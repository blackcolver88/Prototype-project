import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckboxConfigComponent } from './checkbox-config.component';

describe('CheckboxConfigComponent', () => {
  let component: CheckboxConfigComponent;
  let fixture: ComponentFixture<CheckboxConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckboxConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckboxConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
