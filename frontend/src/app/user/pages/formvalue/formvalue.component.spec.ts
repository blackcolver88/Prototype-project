import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormvalueComponent } from './formvalue.component';

describe('FormvalueComponent', () => {
  let component: FormvalueComponent;
  let fixture: ComponentFixture<FormvalueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormvalueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormvalueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
